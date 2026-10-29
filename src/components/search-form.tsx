import Link from "next/link";

type SearchFormProps = {
  // 현재 검색어. 없으면 빈 문자열.
  query: string;
  // "all" | "none"(미분류) | 카테고리 id. 검색해도 카테고리 필터를 유지한다.
  category: string;
};

// 일반 GET 폼이라 '검색' 버튼 클릭과 Enter 키 모두 /dashboard?q=...로 이동한다.
export function SearchForm({ query, category }: SearchFormProps) {
  const clearHref =
    category === "all" ? "/dashboard" : `/dashboard?category=${category}`;

  return (
    <form
      action="/dashboard"
      role="search"
      aria-label="뉴스 검색"
      className="flex w-full items-center gap-2 sm:w-auto"
    >
      {category !== "all" && (
        <input type="hidden" name="category" value={category} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="검색어"
        className="min-w-0 flex-1 rounded-lg sm:w-56 sm:flex-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        검색
      </button>
      {query && (
        <Link
          href={clearHref}
          className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
