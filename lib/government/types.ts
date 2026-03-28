/**
 * Government verification status — aligned with `VerificationStatus` in `schema.prisma`.
 * Keep these literals in sync when the schema enum changes; map API responses here in the real client.
 */
export type GovernmentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type GovernmentVerificationInput = {
  /** Optional ID from Indian Handicrafts Portal when integrated */
  externalPortalId?: string | null;
  email?: string | null;
  displayName?: string | null;
  /**
   * Optional metadata from the registry export (stored on `ArtisanProfile`; **not** used for matching).
   */
  govState?: string | null;
  govDistrict?: string | null;
  govCraft?: string | null;
  govGender?: string | null;
  /** Required for stub matching: last **4** digits are compared to the CSV `Mobile` column (masked). */
  govMobile?: string | null;
};

export type GovernmentVerificationResult = {
  status: GovernmentVerificationStatus;
  externalPortalId?: string | null;
  /** Human-readable detail for logs or admin UI (not for public verify page) */
  message?: string;
};
