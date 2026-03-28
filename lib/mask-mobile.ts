/**
 * Display form for stored digits-only mobile (e.g. XXXXXX1234). Does not encrypt; UI-only.
 */
export function formatMobileForDisplay(digits: string | null | undefined): string {
  const d = digits?.replace(/\D/g, "") ?? "";
  if (d.length === 0) return "—";
  if (d.length <= 4) return `XXXX${d}`;
  return `${"X".repeat(d.length - 4)}${d.slice(-4)}`;
}
