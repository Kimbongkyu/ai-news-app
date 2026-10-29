import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SignInGate } from "@/components/sign-in-gate";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 수집기",
  description: "AI 뉴스를 수집해 한국어로 요약합니다",
};

// 로그인 여부(쿠키)를 읽으므로 cacheComponents 하에서 prerender하지 않는다.
export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      // 테마 스크립트가 붙이는 dark 클래스와 브라우저 확장이 <html>에 주입하는 속성으로 생기는 hydration 경고를 무시한다.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 첫 페인트 전에 저장된 테마(없으면 OS 설정)를 적용한다. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense>
          <ClerkProvider>
            <header className="flex items-center justify-end gap-3 p-4">
              <ThemeToggle />
              <Show when="signed-in">
                <UserButton />
              </Show>
            </header>
            <Show when="signed-out">
              <SignInGate />
            </Show>
            <Show when="signed-in">
              {children}
              <SiteFooter />
            </Show>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
