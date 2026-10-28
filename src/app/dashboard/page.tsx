import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { Suspense } from "react";
import { CategoryBar } from "@/components/category-bar";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { NewsCard } from "@/components/news-card";
import { NewsCountBadge } from "@/components/news-count-badge";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { db } from "@/db";
import { articles, categories, notionSaves } from "@/db/schema";
import { ensureUser } from "@/lib/users";

export const instant = false;

const PAGE_SIZE = 9;

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">AI 뉴스 수집기</h1>
        <FetchNewsButton />
      </div>
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
  const { category, page: pageParam, q } = await searchParams;
  const param = typeof category === "string" ? category : "all";
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";

  const categoryList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.id);

  // 존재하지 않는 id가 오면 전체로 취급한다.
  const selectedCategory = categoryList.find((c) => String(c.id) === param);
  const selected = selectedCategory ? param : param === "none" ? "none" : "all";

  const categoryFilter =
    selected === "none"
      ? isNull(articles.categoryId)
      : selectedCategory
        ? eq(articles.categoryId, selectedCategory.id)
        : undefined;

  // 한국어 제목·요약과 원문 제목에서 대소문자 구분 없이 찾는다. LIKE 특수문자는 이스케이프한다.
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const searchFilter = query
    ? or(
        ilike(articles.titleKo, pattern),
        ilike(articles.summaryKo, pattern),
        ilike(articles.originalTitle, pattern),
      )
    : undefined;

  const filter = and(categoryFilter, searchFilter);

  const [{ total }] = await db
    .select({ total: count() })
    .from(articles)
    .where(filter);
  // 배지에는 필터·검색과 무관한 전체 수집 건수를 보여 준다.
  const [{ allTotal }] = await db.select({ allTotal: count() }).from(articles);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // 잘못된 값이나 범위를 벗어난 페이지는 가장 가까운 유효 페이지로 맞춘다.
  const requested = Number.parseInt(
    typeof pageParam === "string" ? pageParam : "1",
    10,
  );
  const page = Math.min(
    Math.max(Number.isNaN(requested) ? 1 : requested, 1),
    totalPages,
  );

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (selected !== "all") params.set("category", selected);
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  const rows = await db
    .select({
      id: articles.id,
      originalTitle: articles.originalTitle,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      source: articles.source,
      url: articles.url,
      publishedAt: articles.publishedAt,
      imageUrl: articles.imageUrl,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(filter)
    // 발행일이 없는 기사는 수집 시각으로 정렬한다.
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const userId = await ensureUser();
  const savedRows = userId
    ? await db
        .select({ articleId: notionSaves.articleId })
        .from(notionSaves)
        .where(eq(notionSaves.userId, userId))
    : [];
  const savedIds = new Set(savedRows.map((r) => r.articleId));

  return (
    <>
      <NewsCountBadge total={allTotal} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryBar categories={categoryList} selected={selected} query={query} />
        <SearchForm query={query} category={selected} />
      </div>
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          {query
            ? `'${query}'에 해당하는 뉴스가 없어요.`
            : selected === "all"
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
              saved={savedIds.has(row.id)}
            />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
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
