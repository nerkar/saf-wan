import "server-only";

/**
 * Non-throwing checklist for bootstrap or diagnostics (e.g. `/api/health` later).
 * Does not validate secret strength or URL reachability.
 */
export function getServerEnvIssues(): string[] {
  const issues: string[] = [];

  if (!process.env.DATABASE_URL?.trim()) {
    issues.push("DATABASE_URL is missing or empty.");
  }

  const authSecret =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (!authSecret) {
    issues.push(
      "AUTH_SECRET or NEXTAUTH_SECRET should be set for Auth.js sessions.",
    );
  }

  const appUrl =
    process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim();
  if (!appUrl) {
    issues.push(
      "NEXTAUTH_URL (and/or AUTH_URL) should match the app origin (required for OAuth callbacks).",
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    issues.push(
      "NEXT_PUBLIC_APP_URL should match the public origin (used for QR code base URL in production).",
    );
  }

  return issues;
}
