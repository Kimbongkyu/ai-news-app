import Image from "next/image";
import type { Article } from "@/db/schema";
import { DeleteNewsButton } from "./delete-news-button";
import { SaveNewsButton } from "./save-news-button";

type NewsCardProps = {
  article: Pick<
    Article,
    | "id"
    | "originalTitle"
    | "titleKo"
    | "summaryKo"
    | "source"
    | "url"
    | "publishedAt"
    | "imageUrl"
  >;
  categoryName: string | null;
  saved: boolean;
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article, categoryName, saved }: NewsCardProps) {
  // 번역이 아직 없으면 원문 제목으로 대체한다.
  const title = article.titleKo ?? article.originalTitle;

  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/40">
      <DeleteNewsButton articleId={article.id} saved={saved} />
      {article.imageUrl && (
        <div className="relative -mx-6 -mt-6 aspect-video overflow-hidden rounded-t-2xl bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span
          className={
            categoryName
              ? "rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }
        >
          {categoryName ?? "미분류"}
        </span>
        <span className="font-medium text-zinc-600 dark:text-zinc-300">
          {article.source}
        </span>
        {article.publishedAt && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt.toISOString()}>
              {dateFormat.format(article.publishedAt)}
            </time>
          </>
        )}
      </div>
      <h2 className="line-clamp-3 text-lg font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-indigo-700 dark:text-zinc-50 dark:group-hover:text-indigo-300">
        {title}
      </h2>
      {article.summaryKo && (
        <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          {article.summaryKo}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
        >
          원문 보기
          <span
            aria-hidden="true"
            className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none"
          >
            ↗
          </span>
        </a>
        <SaveNewsButton articleId={article.id} initialSaved={saved} />
      </div>
    </article>
  );
}
