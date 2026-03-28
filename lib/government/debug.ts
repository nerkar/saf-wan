import "server-only";

function isGovVerifyDebugEnabled(): boolean {
  const v = process.env.GOV_VERIFICATION_DEBUG?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Opt-in terminal logs for registry matching. Set `GOV_VERIFICATION_DEBUG=1` in `.env`. */
export function govVerifyDebug(message: string, data?: Record<string, unknown>): void {
  if (!isGovVerifyDebugEnabled()) return;
  if (data !== undefined) {
    console.log(`[gov-verify] ${message}`, data);
  } else {
    console.log(`[gov-verify] ${message}`);
  }
}
