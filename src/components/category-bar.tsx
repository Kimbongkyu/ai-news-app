import Link from "next/link";
import type { Category } from "@/db/schema";

type CategoryBarProps = {
  categories: Pick<Category, "id" | "name">[];
  // "all" | "none"(미분류) | 카테고리 id
  selected: string;
};

const chip =
  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const idle =
  "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800";
const active = "bg-indigo-600 text-white dark:bg-indigo-500";

export function CategoryBar({ categories, selected }: CategoryBarProps) {
  const items = [
    { key: "all", label: "전체", href: "/dashboard" },
    ...categories.map((c) => ({
      key: String(c.id),
      label: c.name,
      href: `/dashboard?category=${c.id}`,
    })),
    { key: "none", label: "미분류", href: "/dashboard?category=none" },
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
