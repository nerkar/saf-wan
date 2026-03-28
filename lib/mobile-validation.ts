/**
 * Normalizes user input to digits only, then applies common Indian formats:
 * - `+91` / `91` prefix (12 digits total → last 10)
 * - leading `0` (11 digits → drop the 0)
 */
export function normalizeIndianMobileDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) {
    d = d.slice(2);
  } else if (d.length === 11 && d.startsWith("0")) {
    d = d.slice(1);
  }
  return d;
}

/**
 * Validates a **10-digit** Indian mobile (digits only after normalization).
 * Registry matching still uses the last 4 digits; this enforces full number shape at input time.
 */
export function parseTenDigitIndianMobile(
  raw: string,
): { ok: true; digits: string } | { ok: false; message: string } {
  const d = normalizeIndianMobileDigits(raw);
  if (d.length !== 10) {
    return {
      ok: false,
      message:
        "Enter a valid 10-digit mobile number. You may use +91 or a leading 0 (e.g. 09876543210).",
    };
  }
  if (!/^[6-9]/.test(d)) {
    return {
      ok: false,
      message: "Indian mobile numbers must be 10 digits and start with 6, 7, 8, or 9.",
    };
  }
  return { ok: true, digits: d };
}
