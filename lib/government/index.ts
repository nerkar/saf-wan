import type {
  GovernmentVerificationInput,
  GovernmentVerificationResult,
} from "./types";

export type {
  GovernmentVerificationInput,
  GovernmentVerificationResult,
  GovernmentVerificationStatus,
} from "./types";

/**
 * Stub: replace body with real HTTP call to the official portal when ready.
 * Keep this as the only integration surface for government verification.
 */
export async function verifyArtisanWithGovernment(
  input: GovernmentVerificationInput,
): Promise<GovernmentVerificationResult> {
  void input;
  await Promise.resolve();
  return {
    status: "VERIFIED",
    externalPortalId: input.externalPortalId ?? "stub-portal-id",
    message: "Stub verification — replace with real API integration.",
  };
}
