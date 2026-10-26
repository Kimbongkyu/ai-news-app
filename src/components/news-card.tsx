import type { Article } from "@/db/schema";

type NewsCardProps = {
  article: Pick<
    Article,
    "originalTitle" | "titleKo" | "summaryKo" | "source" | "url" | "publishedAt"
  >;
  categoryName: string | null;
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article, categoryName }: NewsCardProps) {
  // 번역이 아직 없으면 원문 제목으로 대체한다.
  const title = article.titleKo ?? article.originalTitle;

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <span
        className={
          categoryName
            ? "w-fit rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            : "w-fit rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        }
      >
        {categoryName ?? "미분류"}
      </span>
      <h2 className="line-clamp-3 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {article.source}
        {article.publishedAt && (
          <>
            {" · "}
            <time dateTime={article.publishedAt.toISOString()}>
              {dateFormat.format(article.publishedAt)}
            </time>
          </>
        )}
      </p>
      {article.summaryKo && (
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {article.summaryKo}
        </p>
      )}
      <div className="mt-auto pt-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>
      </div>
    </article>
  );
}
