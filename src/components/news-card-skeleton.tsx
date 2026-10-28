export function NewsCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="-mx-5 -mt-5 aspect-video rounded-t-xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-5 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-5 w-11/12 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-3 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

const DEFAULT_SKELETON_COUNT = 6;

export function NewsGridSkeleton({
  count = DEFAULT_SKELETON_COUNT,
}: {
  count?: number;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="뉴스를 불러오는 중"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
