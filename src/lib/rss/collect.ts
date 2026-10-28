import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { parseFeed, type FeedItem } from "./parse";
import { IMAGE_HOSTS, RSS_SOURCES } from "./sources";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

export type CollectResult = {
  added: number;
  // 이번에 새로 저장된 기사 id. 이후 OpenAI 번역·요약·분류 단계의 입력으로 쓴다.
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

// 허용 호스트의 https 이미지만 쓴다. 그 외에는 null(썸네일 없음).
function allowedImage(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && IMAGE_HOSTS.includes(u.hostname) ? url : null;
  } catch {
    return null;
  }
}

// 피드에 이미지가 없는 글(TechCrunch)은 기사 페이지의 og:image를 가져온다.
async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const res = await fetch(articleUrl, {
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0 (compatible; ai-news-collector)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    return m ? m[1].replace(/&#0?38;|&amp;/g, "&") : null;
  } catch {
    return null;
  }
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
        excerpt: item.excerpt,
        publishedAt: item.publishedAt,
        imageUrl: allowedImage(item.imageUrl),
      });
    }
  });

  if (rows.length === 0) return { added: 0, addedIds: [], errors };

  // 이미 저장된 글은 페이지를 다시 가져오지 않도록, 새 글 중 이미지가 없는 것만 보강한다.
  const existing = new Set(
    (
      await db
        .select({ url: articles.url })
        .from(articles)
        .where(inArray(articles.url, rows.map((r) => r.url)))
    ).map((r) => r.url),
  );
  const missing = rows.filter((r) => !r.imageUrl && !existing.has(r.url));
  const ogImages = await Promise.all(missing.map((r) => fetchOgImage(r.url)));
  missing.forEach((r, i) => {
    r.imageUrl = allowedImage(ogImages[i]);
  });

  const inserted = await db
    .insert(articles)
    .values(rows)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return { added: inserted.length, addedIds: inserted.map((r) => r.id), errors };
}
