import { collectNews } from "@/lib/rss/collect";

export async function POST() {
  try {
    const { added, errors } = await collectNews();
    return Response.json({ added, errors });
  } catch (e) {
    console.error("news fetch failed", e);
    return Response.json({ error: "뉴스를 가져오지 못했어요." }, { status: 500 });
  }
}
