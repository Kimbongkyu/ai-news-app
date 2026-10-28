import type { Article } from "@/db/schema";

const NOTION_VERSION = "2022-06-28";

type NotionArticle = Pick<
  Article,
  "originalTitle" | "titleKo" | "summaryKo" | "source" | "url" | "publishedAt"
>;

// rich_text 한 덩어리는 2000자 제한이 있다.
const text = (value: string) => [{ text: { content: value.slice(0, 2000) } }];

// select 옵션 이름에는 쉼표를 쓸 수 없다.
const option = (value: string) => ({ name: value.replaceAll(",", " ").trim() });

/** 기사를 Notion 데이터베이스에 페이지로 저장하고 페이지 URL을 돌려준다. */
export async function saveArticleToNotion(
  article: NotionArticle,
  categoryName: string | null,
): Promise<string> {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("NOTION_API_TOKEN / NOTION_DATABASE_ID가 설정되지 않았어요.");
  }

  const properties: Record<string, unknown> = {
    제목: { title: text(article.titleKo ?? article.originalTitle) },
    "원문 링크": { url: article.url },
    출처: { select: option(article.source) },
  };
  if (article.summaryKo) properties["요약"] = { rich_text: text(article.summaryKo) };
  if (categoryName) properties["카테고리"] = { select: option(categoryName) };
  if (article.publishedAt) {
    properties["발행일"] = { date: { start: article.publishedAt.toISOString() } };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  if (!res.ok) {
    throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  }
  const page = (await res.json()) as { url: string };
  return page.url;
}
