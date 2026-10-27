"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "뉴스를 가져오지 못했어요.");
        return;
      }
      const failed: string[] = data.errors ?? [];
      setMessage(
        failed.length > 0
          ? `${data.added}건 추가됨 (${failed.join(", ")} 실패)`
          : `${data.added}건 추가됨`,
      );
      startTransition(() => router.refresh());
    } catch {
      setMessage("뉴스를 가져오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || isPending;

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span role="status" className="text-sm text-zinc-500 dark:text-zinc-400">
          {message}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {busy ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}
