import type { VerificationStatus } from "@prisma/client";

export type GovernmentVerificationInput = {
  /** Optional ID from Indian Handicrafts Portal when integrated */
  externalPortalId?: string | null;
  email?: string | null;
  displayName?: string | null;
};

export type GovernmentVerificationResult = {
  status: VerificationStatus;
  externalPortalId?: string | null;
  message?: string;
};

/**
 * Stub: replace body with real HTTP call to indian.handicrafts.gov.in when ready.
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
