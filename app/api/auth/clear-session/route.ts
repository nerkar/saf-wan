import { signOut } from "@/auth";

/**
 * Clears the Auth.js session cookie (JWT invalidation). Only invokable from a Route Handler
 * so `cookies()` can be updated — do not call `signOut()` from Server Components or `requireUserId()`.
 */
export async function GET() {
  return signOut({ redirectTo: "/login" });
}
