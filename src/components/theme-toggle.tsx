"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme";

// 아이콘은 dark 클래스에 따라 CSS로 바꾸므로 서버·클라이언트 렌더 결과가 같다(hydration 불일치 없음).
export function ThemeToggle() {
  function onClick() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // 저장소를 쓸 수 없어도 현재 화면의 전환은 유지한다.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="다크/라이트 모드 전환"
      title="다크/라이트 모드 전환"
      className="flex size-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {/* 라이트 모드: 달 아이콘(누르면 다크) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 dark:hidden"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* 다크 모드: 해 아이콘(누르면 라이트) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden size-5 dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
