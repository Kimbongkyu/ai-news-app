import { desc, eq, isNull, sql } from "drizzle-orm";
import { Suspense } from "react";
import { CategoryBar } from "@/components/category-bar";
import { NewsCard } from "@/components/news-card";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const instant = false;

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold tracking-tight">AI 뉴스 수집기</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { category } = await searchParams;
  const param = typeof category === "string" ? category : "all";

  const categoryList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.id);

  // 존재하지 않는 id가 오면 전체로 취급한다.
  const selectedCategory = categoryList.find((c) => String(c.id) === param);
  const selected = selectedCategory ? param : param === "none" ? "none" : "all";

  const filter =
    selected === "none"
      ? isNull(articles.categoryId)
      : selectedCategory
        ? eq(articles.categoryId, selectedCategory.id)
        : undefined;

  const rows = await db
    .select({
      id: articles.id,
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
    .where(filter)
    // 발행일이 없는 기사는 수집 시각으로 정렬한다.
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    );

  return (
    <>
      <CategoryBar categories={categoryList} selected={selected} />
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          {selected === "all"
            ? "아직 뉴스가 없어요. '뉴스 가져오기'를 눌러 보세요."
            : "이 카테고리에 해당하는 뉴스가 없어요."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <NewsCard
              key={row.id}
              article={row}
              categoryName={row.categoryName}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
