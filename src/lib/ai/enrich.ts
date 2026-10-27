import { desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { getOpenAI, OPENAI_MODEL } from "./openai";
import {
  SYSTEM_PROMPT,
  buildSchema,
  buildUserMessage,
  type EnrichInput,
} from "./prompt";

// 1회 실행당 처리 상한 / 호출당 기사 수 / 동시 호출 수
const MAX_PER_RUN = 30;
const BATCH_SIZE = 5;
const CONCURRENCY = 3;

const responseSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int(),
      title_ko: z.string().trim().min(1),
      summary_ko: z.string().trim().min(1),
      category: z.string().nullable(),
    }),
  ),
});

export type EnrichResult = {
  enriched: number;
  failed: number;
};

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

async function enrichBatch(
  batch: EnrichInput[],
  categoryIds: Map<string, number>,
): Promise<number> {
  const names = [...categoryIds.keys()];
  const completion = await getOpenAI().chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(names, batch) },
    ],
    response_format: { type: "json_schema", json_schema: buildSchema(names) },
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("empty OpenAI response");
  const parsed = responseSchema.parse(JSON.parse(content));

  // 요청하지 않은 id는 무시하고, 항목별로 저장한다.
  const requested = new Set(batch.map((b) => b.id));
  let saved = 0;
  for (const item of parsed.items) {
    if (!requested.has(item.id)) continue;
    await db
      .update(articles)
      .set({
        titleKo: item.title_ko,
        summaryKo: item.summary_ko,
        // 목록에 없는 이름이면 미분류(null)
        categoryId: item.category
          ? (categoryIds.get(item.category) ?? null)
          : null,
      })
      .where(eq(articles.id, item.id));
    saved++;
  }
  return saved;
}

// 아직 번역되지 않은 기사(title_ko가 null)를 최신순으로 최대 MAX_PER_RUN건 처리한다.
// 이전 실행에서 실패한 기사도 자연스럽게 여기서 다시 시도된다.
export async function enrichPendingArticles(): Promise<EnrichResult> {
  const pending = await db
    .select({
      id: articles.id,
      title: articles.originalTitle,
      excerpt: articles.excerpt,
    })
    .from(articles)
    .where(isNull(articles.titleKo))
    .orderBy(desc(articles.publishedAt))
    .limit(MAX_PER_RUN);

  if (pending.length === 0) return { enriched: 0, failed: 0 };

  const cats = await db.select().from(categories);
  const categoryIds = new Map(cats.map((c) => [c.name, c.id]));

  const batches = chunk(
    pending.map((p) => ({ ...p, excerpt: p.excerpt ?? "" })),
    BATCH_SIZE,
  );

  let enriched = 0;
  for (const group of chunk(batches, CONCURRENCY)) {
    const settled = await Promise.allSettled(
      group.map((b) => enrichBatch(b, categoryIds)),
    );
    settled.forEach((r, i) => {
      if (r.status === "fulfilled") {
        enriched += r.value;
      } else {
        const ids = group[i].map((b) => b.id);
        console.error("enrich batch failed", ids, r.reason);
      }
    });
  }

  return { enriched, failed: pending.length - enriched };
}
