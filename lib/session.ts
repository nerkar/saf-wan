import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Returns the signed-in user’s database id (`User.id`), or redirects to `/login`.
 * Use in Server Components, Route Handlers, and Server Actions that require auth.
 *
 * @example
 * const userId = await requireUserId();
 * await prisma.product.findMany({ where: { artisanId: userId, archived: false } });
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    redirect("/login");
  }
  return id;
}

/**
 * Same as `requireUserId` but returns `undefined` instead of redirecting.
 * Use when the route is optional-auth or you handle unauthenticated state yourself.
 */
export async function getOptionalUserId(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.id;
}

/**
 * Raw session from Auth.js (JWT). Prefer `requireUserId` / `getOptionalUserId` for `user.id`.
 */
export async function getSession() {
  return auth();
}
