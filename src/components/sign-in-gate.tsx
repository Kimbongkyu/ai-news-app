"use client";

import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

// 비로그인 사용자에게 로그인 모달을 자동으로 띄운다. 모달을 닫으면 버튼으로 다시 연다.
export function SignInGate() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const opened = useRef(false);

  useEffect(() => {
    // 로그인 직후 이 컴포넌트가 잠깐 남아 있어도 이미 로그인된 상태면 모달을 열지 않는다.
    if (!isLoaded || isSignedIn || opened.current) return;
    opened.current = true;
    clerk.openSignIn();
  }, [clerk, isLoaded, isSignedIn]);

  // 로그인되면(또는 게이트가 내려가면) 명령형으로 연 모달을 직접 닫는다.
  useEffect(() => {
    if (isSignedIn) clerk.closeSignIn();
    return () => clerk.closeSignIn();
  }, [clerk, isSignedIn]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
      <p className="text-zinc-500 dark:text-zinc-400">서비스를 이용하려면 로그인이 필요합니다.</p>
      <SignInButton mode="modal">
        <button className="rounded-full bg-black px-5 py-2 text-white dark:bg-white dark:text-black">
          로그인
        </button>
      </SignInButton>
    </main>
  );
}
