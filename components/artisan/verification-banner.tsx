import type { VerificationStatus } from "@prisma/client";
import Link from "next/link";

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
      <div className="craft-alert craft-alert-warn border-amber-300/80">
        <strong>Verification pending.</strong> The last 4 digits of your mobile did not match the
        registry CSV, or your profile has no mobile yet (e.g. Google sign-in). Adding products and
        media is disabled until verification succeeds.{" "}
        <Link href="/artisan/profile" className="craft-link font-semibold">
          Edit registry profile
        </Link>{" "}
        to add or update your mobile and other details.
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="craft-alert craft-alert-error">
        <strong>Verification rejected.</strong> Contact support or update your details when the
        government API integration is available.
      </div>
    );
  }

  return null;
}
