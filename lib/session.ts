import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the signed-in user’s database id (`User.id`), or redirects to `/login`.
 * If the JWT references a user that no longer exists (e.g. DB reset), redirects to
 * `/api/auth/clear-session` so the session cookie is cleared in a Route Handler (Next.js
 * only allows cookie writes there or in Server Actions — not during RSC).
 *
 * @example
 * const userId = await requireUserId();
 * await prisma.product.findMany({ where: { artisanId: userId, archived: false } });
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const tokenId = session?.user?.id;
  if (typeof tokenId !== "string" || tokenId.length === 0) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenId },
    select: { id: true },
  });
  if (!user) {
    redirect("/api/auth/clear-session");
  }

  return user.id;
}

/**
 * Session JWT `user.id` only if a matching `User` row exists.
 * Use in Route Handlers that must return JSON (401) instead of redirecting.
 */
export async function getVerifiedUserId(): Promise<string | undefined> {
  const session = await auth();
  const tokenId = session?.user?.id;
  if (typeof tokenId !== "string" || tokenId.length === 0) {
    return undefined;
  }
  const user = await prisma.user.findUnique({
    where: { id: tokenId },
    select: { id: true },
  });
  return user?.id;
}

/**
 * Same as `requireUserId` but returns `undefined` instead of redirecting.
 * Does not verify the user still exists in the database (lighter check only).
 */
export async function getOptionalUserId(): Promise<string | undefined> {
  const session = await auth();
  const id = session?.user?.id;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

/**
 * Raw session from Auth.js (JWT). Prefer `requireUserId` / `getOptionalUserId` for `user.id`.
 */
export async function getSession() {
  return auth();
}
