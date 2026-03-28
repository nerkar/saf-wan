import { govVerifyDebug } from "./debug";
import { findRegistryMatch } from "./match-registry";
import type {
  GovernmentVerificationInput,
  GovernmentVerificationResult,
} from "./types";

export type {
  GovernmentVerificationInput,
  GovernmentVerificationResult,
  GovernmentVerificationStatus,
} from "./types";

export type { GovernmentRegistryRow } from "./match-registry";

/**
 * Stub registry lookup (no HTTP). Replace implementation with a real portal client when integrated.
 * **Single entry point** for artisan verification — do not duplicate matching logic elsewhere.
 */
export async function verifyArtisanWithGovernment(
  input: GovernmentVerificationInput,
): Promise<GovernmentVerificationResult> {
  await Promise.resolve();

  govVerifyDebug("verifyArtisanWithGovernment: input snapshot", {
    email: input.email ?? null,
    hasGovMobile: Boolean(input.govMobile?.trim()),
    govMobileDigitCount: input.govMobile?.replace(/\D/g, "").length ?? 0,
  });

  const row = findRegistryMatch(input);
  if (row) {
    govVerifyDebug("verifyArtisanWithGovernment: result VERIFIED", { sNo: row.sNo });
    return {
      status: "VERIFIED",
      externalPortalId: input.externalPortalId ?? `gov-registry:${row.sNo}`,
      message: "Matched official handicrafts registry (stub dataset).",
    };
  }

  govVerifyDebug("verifyArtisanWithGovernment: result PENDING (no registry row)");
  return {
    status: "PENDING",
    externalPortalId: input.externalPortalId ?? undefined,
    message:
      "No matching record in the handicrafts registry (stub). Products stay disabled until verified.",
  };
}
