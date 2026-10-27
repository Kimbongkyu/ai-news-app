import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SignInGate } from "@/components/sign-in-gate";
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
      // 브라우저 확장이 <html>에 속성을 주입해 생기는 hydration 경고를 무시한다.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense>
          <ClerkProvider>
            <Show when="signed-out">
              <SignInGate />
            </Show>
            <Show when="signed-in">
              <header className="flex justify-end p-4">
                <UserButton />
              </header>
              {children}
            </Show>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
