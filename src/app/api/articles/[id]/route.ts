import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, notionSaves } from "@/db/schema";
import { archiveNotionPage } from "@/lib/notion";
import { ensureUser } from "@/lib/users";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/articles/[id]">,
) {
  const userId = await ensureUser();
  if (!userId) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });

  const articleId = Number((await ctx.params).id);
  if (!Number.isInteger(articleId)) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const [article] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, articleId));
    if (!article) return Response.json({ error: "뉴스를 찾을 수 없어요." }, { status: 404 });

    // 기사는 모든 사용자가 공유하므로, 어느 사용자가 Notion에 저장했든 모두 지운다.
    // Notion 삭제가 실패하면 DB는 그대로 두어 다시 시도할 수 있게 한다.
    const saves = await db
      .select({ url: notionSaves.notionPageUrl })
      .from(notionSaves)
      .where(eq(notionSaves.articleId, articleId));
    for (const save of saves) {
      await archiveNotionPage(save.url);
    }

    // notion_saves는 article_id FK의 cascade로 함께 삭제된다.
    await db.delete(articles).where(eq(articles.id, articleId));
    return Response.json({ deleted: true });
  } catch (e) {
    console.error("article delete failed", e);
    return Response.json({ error: "뉴스를 삭제하지 못했어요." }, { status: 500 });
  }
}
