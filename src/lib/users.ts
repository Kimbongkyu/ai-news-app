import { auth, currentUser } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/** 로그인 사용자의 앱 DB 행을 보장하고 Clerk user ID를 돌려준다. 비로그인이면 null. */
export async function ensureUser(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId));
  if (existing) return userId;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  const [{ total }] = await db.select({ total: count() }).from(users);
  const isAdmin =
    total === 0 || (!!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL);

  await db
    .insert(users)
    .values({ id: userId, email, role: isAdmin ? "admin" : "user" })
    .onConflictDoNothing();
  return userId;
}
