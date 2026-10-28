export function NewsCountBadge({ total }: { total: number }) {
  return (
    <p className="w-fit rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      총{" "}
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {total.toLocaleString("ko-KR")}개
      </span>
      의 뉴스
    </p>
  );
}
