"use client";

import { useState } from "react";

export function SaveNewsButton({
  articleId,
  initialSaved,
}: {
  articleId: number;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/notion`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장하지 못했어요.");
        return;
      }
      setSaved(true);
    } catch {
      setError("저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <button
        type="button"
        disabled
        className="rounded-lg border border-emerald-600/40 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
      >
        저장됨
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {saving ? "저장 중…" : "뉴스 저장"}
      </button>
    </div>
  );
}
