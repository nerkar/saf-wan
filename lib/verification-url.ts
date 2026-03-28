/**
 * Public verification URLs for QR codes and deep links.
 *
 * Uses NEXT_PUBLIC_APP_URL (no trailing slash). Server and client code that
 * builds user-facing verify links should import from here so QR, emails, and
 * UI stay consistent across environments (local, preview, production).
 *
 * @see docs/public-site-and-qr.md
 */
export function getPublicAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Full URL for the public verification page: `{base}/verify/{productId}`. */
export function getProductVerificationUrl(productId: string): string {
  return `${getPublicAppBaseUrl()}/verify/${productId}`;
}
