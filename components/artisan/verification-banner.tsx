import type { VerificationStatus } from "@prisma/client";

type Props = {
  status: VerificationStatus | null | undefined;
};

/**
 * Surfaces government verification state for artisans (Dev 1 onboarding UX).
 */
export function VerificationBanner({ status }: Props) {
  if (status === "VERIFIED" || status == null) {
    return null;
  }

  if (status === "PENDING") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Verification pending.</strong> Your account is being validated against the official
        handicrafts registry (stub in development). You can still use the dashboard.
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
        <strong>Verification rejected.</strong> Contact support or update your details when the
        government API integration is available.
      </div>
    );
  }

  return null;
}
