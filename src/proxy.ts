import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 내부 경로와 정적 파일은 제외
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
