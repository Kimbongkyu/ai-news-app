import Link from "next/link";
import type { Category } from "@/db/schema";

type CategoryBarProps = {
  categories: Pick<Category, "id" | "name">[];
  // "all" | "none"(미분류) | 카테고리 id
  selected: string;
  // 현재 검색어. 카테고리를 바꿔도 유지한다.
  query?: string;
};

const chip =
  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const idle =
  "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800";
const active = "bg-indigo-600 text-white dark:bg-indigo-500";

export function CategoryBar({ categories, selected, query }: CategoryBarProps) {
  const hrefFor = (category: string) => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  const items = [
    { key: "all", label: "전체", href: hrefFor("all") },
    ...categories.map((c) => ({
      key: String(c.id),
      label: c.name,
      href: hrefFor(String(c.id)),
    })),
    { key: "none", label: "미분류", href: hrefFor("none") },
  ];

  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isSelected = item.key === selected;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isSelected ? "page" : undefined}
            className={`${chip} ${isSelected ? active : idle}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
