import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";
import { saveArticleToNotion } from "@/lib/notion";
import { ensureUser } from "@/lib/users";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/articles/[id]/notion">,
) {
  const userId = await ensureUser();
  if (!userId) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });

  const articleId = Number((await ctx.params).id);
  if (!Number.isInteger(articleId)) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const [saved] = await db
      .select({ url: notionSaves.notionPageUrl })
      .from(notionSaves)
      .where(and(eq(notionSaves.userId, userId), eq(notionSaves.articleId, articleId)));
    if (saved) return Response.json({ saved: true, notionPageUrl: saved.url });

    const [row] = await db
      .select({
        originalTitle: articles.originalTitle,
        titleKo: articles.titleKo,
        summaryKo: articles.summaryKo,
        source: articles.source,
        url: articles.url,
        publishedAt: articles.publishedAt,
        categoryName: categories.name,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.id, articleId));
    if (!row) return Response.json({ error: "뉴스를 찾을 수 없어요." }, { status: 404 });

    const notionPageUrl = await saveArticleToNotion(row, row.categoryName);
    await db
      .insert(notionSaves)
      .values({ userId, articleId, notionPageUrl })
      .onConflictDoNothing();
    return Response.json({ saved: true, notionPageUrl });
  } catch (e) {
    console.error("notion save failed", e);
    return Response.json({ error: "Notion에 저장하지 못했어요." }, { status: 500 });
  }
}
