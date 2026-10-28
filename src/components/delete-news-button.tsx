"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteNewsButton({
  articleId,
  saved,
}: {
  articleId: number;
  saved: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    const message = saved
      ? "이 뉴스를 삭제할까요? Notion에 저장된 페이지도 함께 삭제돼요."
      : "이 뉴스를 삭제할까요?";
    if (!window.confirm(message)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "삭제하지 못했어요.");
        return;
      }
      router.refresh();
    } catch {
      setError("삭제하지 못했어요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
      {error && (
        <span
          role="alert"
          className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={deleting}
        aria-label="뉴스 삭제"
        className="flex size-7 items-center justify-center rounded-full bg-white/80 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        {deleting ? "…" : "✕"}
      </button>
    </div>
  );
}
