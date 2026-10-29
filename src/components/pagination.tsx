import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  // 페이지 번호를 받아 링크 주소를 만든다. 카테고리 필터를 유지하기 위해 호출 측에서 정한다.
  hrefFor: (page: number) => string;
};

const base =
  "min-w-9 rounded-lg px-3 py-1.5 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const idle =
  "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800";
const active = "bg-indigo-600 text-white dark:bg-indigo-500";
const disabled =
  "cursor-not-allowed border border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600";

// 현재 페이지 앞뒤로 보여 줄 페이지 수
const SIBLINGS = 2;

// 첫 페이지, 현재 페이지 주변, 마지막 페이지를 고르고 떨어진 구간 사이에만 "gap"을 넣는다.
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  const wanted = new Set([1, totalPages]);
  for (let p = page - SIBLINGS; p <= page + SIBLINGS; p++) {
    if (p >= 1 && p <= totalPages) wanted.add(p);
  }
  const sorted = [...wanted].sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

function NavButton({
  label,
  target,
  enabled,
  hrefFor,
}: {
  label: string;
  target: number;
  enabled: boolean;
  hrefFor: (page: number) => string;
}) {
  return enabled ? (
    <Link href={hrefFor(target)} className={`${base} ${idle}`}>
      {label}
    </Link>
  ) : (
    <span aria-disabled className={`${base} ${disabled}`}>
      {label}
    </span>
  );
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="페이지" className="flex flex-wrap justify-center gap-2">
      <NavButton label="처음" target={1} enabled={hasPrev} hrefFor={hrefFor} />
      <NavButton label="이전" target={page - 1} enabled={hasPrev} hrefFor={hrefFor} />
      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 py-1.5 text-sm text-zinc-400 dark:text-zinc-500"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${item === page ? active : idle}`}
          >
            {item}
          </Link>
        ),
      )}
      <NavButton label="다음" target={page + 1} enabled={hasNext} hrefFor={hrefFor} />
      <NavButton label="끝" target={totalPages} enabled={hasNext} hrefFor={hrefFor} />
    </nav>
  );
}
