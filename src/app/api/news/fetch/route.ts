import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fetchState } from "@/db/schema";
import { enrichPendingArticles } from "@/lib/ai/enrich";
import { collectNews } from "@/lib/rss/collect";

// 전역 재실행 간격. 이 안에서는 RSS도 OpenAI도 호출하지 않는다.
const MIN_INTERVAL_MS = 10 * 60 * 1000;

export async function POST() {
  try {
    const [state] = await db.select().from(fetchState).where(eq(fetchState.id, 1));
    const last = state?.lastFetchedAt?.getTime();
    if (last && Date.now() - last < MIN_INTERVAL_MS) {
      return Response.json({ added: 0, enriched: 0, errors: [], skipped: true });
    }

    // 동시 실행을 줄이기 위해 시작 시점에 먼저 기록한다.
    const now = new Date();
    await db
      .insert(fetchState)
      .values({ id: 1, lastFetchedAt: now })
      .onConflictDoUpdate({
        target: fetchState.id,
        set: { lastFetchedAt: now },
      });

    const { added, errors } = await collectNews();

    // OpenAI 실패가 수집 결과를 막지 않도록 분리한다.
    let enriched = 0;
    try {
      ({ enriched } = await enrichPendingArticles());
    } catch (e) {
      console.error("news enrich failed", e);
      errors.push("OpenAI");
    }

    return Response.json({ added, enriched, errors });
  } catch (e) {
    console.error("news fetch failed", e);
    return Response.json({ error: "뉴스를 가져오지 못했어요." }, { status: 500 });
  }
}
