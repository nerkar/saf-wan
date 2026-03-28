import type { VerificationStatus } from "@prisma/client";
import Link from "next/link";
import { formatMobileForDisplay } from "@/lib/mask-mobile";

type Props = {
  verificationStatus: VerificationStatus;
  displayName: string | null;
  accountEmail: string | null;
  accountName: string | null;
  govState: string | null;
  govDistrict: string | null;
  govCraft: string | null;
  govGender: string | null;
  govMobile: string | null;
  externalPortalId: string | null;
};

function statusLabel(status: VerificationStatus): { label: string; className: string } {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Active (verified)",
        className: "bg-emerald-50 text-emerald-900 ring-emerald-200",
      };
    case "PENDING":
      return {
        label: "Pending verification",
        className: "bg-amber-50 text-amber-950 ring-amber-200",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-red-50 text-red-950 ring-red-200",
      };
    default:
      return { label: status, className: "bg-stone-100 text-stone-800 ring-stone-200" };
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[8rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-900">{value || "—"}</dd>
    </div>
  );
}

/**
 * Collapsible registry / account details for the signed-in artisan (verified or pending).
 */
export function ArtistProfileDetails(props: Props) {
  const badge = statusLabel(props.verificationStatus);

  return (
    <details className="group craft-card overflow-hidden">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[var(--craft-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span aria-hidden className="text-[var(--craft-accent)] transition group-open:rotate-90">
              ▸
            </span>
            Profile details
          </span>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badge.className}`}
          >
            {badge.label}
          </span>
        </span>
      </summary>

      <div className="space-y-4 border-t border-[var(--craft-border)] bg-[var(--craft-surface-muted)]/50 px-5 pb-5 pt-4">
        <p className="text-xs text-[var(--craft-muted)]">
          Information you registered (and optional registry fields). Shown whether your account is
          pending or verified.
        </p>

        <dl className="space-y-3">
          <Row label="Account email" value={props.accountEmail ?? "—"} />
          <Row label="Display name" value={props.displayName ?? props.accountName ?? "—"} />
          <Row label="State" value={props.govState ?? "—"} />
          <Row label="District" value={props.govDistrict ?? "—"} />
          <Row label="Craft" value={props.govCraft ?? "—"} />
          <Row label="Gender" value={props.govGender ?? "—"} />
          <Row label="Mobile (masked)" value={formatMobileForDisplay(props.govMobile)} />
          {props.externalPortalId ? (
            <Row label="Registry ref" value={props.externalPortalId} />
          ) : null}
        </dl>

        <p className="craft-divider pt-4">
          <Link href="/artisan/profile" className="craft-link text-sm">
            Edit registry profile
          </Link>
        </p>
      </div>
    </details>
  );
}
