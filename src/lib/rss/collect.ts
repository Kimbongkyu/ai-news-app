import { db } from "@/db";
import { articles } from "@/db/schema";
import { parseFeed, type FeedItem } from "./parse";
import { RSS_SOURCES } from "./sources";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

export type CollectResult = {
  added: number;
  // 이번에 새로 저장된 기사 id. 이후 Claude 분류 단계의 입력으로 쓴다.
  addedIds: number[];
  errors: string[];
};

async function fetchFeed(feedUrl: string): Promise<FeedItem[]> {
  const res = await fetch(feedUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text());
}

// 최근 24시간 글만 수집해 저장한다. 번역·요약·카테고리는 비워 둔다.
export async function collectNews(): Promise<CollectResult> {
  const since = Date.now() - WINDOW_MS;

  const settled = await Promise.allSettled(
    RSS_SOURCES.map((s) => fetchFeed(s.feedUrl)),
  );

  const errors: string[] = [];
  const rows: (typeof articles.$inferInsert)[] = [];

  settled.forEach((result, i) => {
    const source = RSS_SOURCES[i].name;
    if (result.status === "rejected") {
      errors.push(source);
      return;
    }
    for (const item of result.value) {
      // 발행일이 없으면 24시간 이내인지 알 수 없어 제외한다.
      if (!item.publishedAt || item.publishedAt.getTime() < since) continue;
      rows.push({
        source,
        url: item.url,
        originalTitle: item.title,
        publishedAt: item.publishedAt,
      });
    }
  });

  if (rows.length === 0) return { added: 0, addedIds: [], errors };

  const inserted = await db
    .insert(articles)
    .values(rows)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return { added: inserted.length, addedIds: inserted.map((r) => r.id), errors };
}
