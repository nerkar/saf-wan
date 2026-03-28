import "server-only";

import fs from "fs";
import path from "path";
import { govVerifyDebug } from "./debug";
import { parseCsvLine } from "./parse-csv-line";
import type { GovernmentVerificationInput } from "./types";

/** One row from `supporting/artist-dataset.csv` (government export stub). */
export type GovernmentRegistryRow = {
  sNo: number;
  state: string;
  district: string;
  craft: string;
  name: string;
  gender: string;
  mobile: string;
};

let cachedRows: GovernmentRegistryRow[] | null = null;

/**
 * Canonical dataset path (repo root). Override with `ARTIST_DATASET_CSV` for tests or custom deploys.
 */
export function getArtistDatasetCsvPath(): string {
  const override = process.env.ARTIST_DATASET_CSV?.trim();
  if (override) return path.isAbsolute(override) ? override : path.join(process.cwd(), override);
  return path.join(process.cwd(), "supporting", "artist-dataset.csv");
}

function parseArtistDatasetCsv(content: string): GovernmentRegistryRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const rows: GovernmentRegistryRow[] = [];
  let skippedShort = 0;
  let skippedNaN = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = parseCsvLine(line);
    if (parts.length < 8) {
      skippedShort++;
      continue;
    }

    const sNo = parseInt(parts[0] ?? "", 10);
    if (Number.isNaN(sNo)) {
      skippedNaN++;
      continue;
    }

    rows.push({
      sNo,
      state: (parts[1] ?? "").trim(),
      district: (parts[2] ?? "").trim(),
      craft: (parts[3] ?? "").trim(),
      name: (parts[4] ?? "").trim(),
      gender: (parts[5] ?? "").trim(),
      mobile: (parts[6] ?? "").trim(),
    });
  }

  govVerifyDebug("CSV parsed", {
    dataRows: rows.length,
    skippedFewerThan8Cols: skippedShort,
    skippedBadSNo: skippedNaN,
    hint: "If skippedFewerThan8Cols is large, check quoted commas in Craft — parseCsvLine should handle them.",
  });

  return rows;
}

function loadRegistryRows(): GovernmentRegistryRow[] {
  const csvPath = getArtistDatasetCsvPath();
  govVerifyDebug("Loading registry CSV", { csvPath });
  const raw = fs.readFileSync(csvPath, "utf8");
  return parseArtistDatasetCsv(raw);
}

/** Lazy-loaded and cached for the process (CSV is large). */
export function getRegistryRows(): GovernmentRegistryRow[] {
  if (!cachedRows) {
    cachedRows = loadRegistryRows();
    govVerifyDebug("Registry cache ready", { rowCount: cachedRows.length });
  }
  return cachedRows;
}

/** Last N decimal digits from user input (e.g. mobile). */
function lastDigits(s: string, n: number): string | null {
  const digits = s.replace(/\D/g, "");
  if (digits.length < n) return null;
  return digits.slice(-n);
}

/** Trailing digits from masked mobile (e.g. XXXXXX3390 → 3390). */
function suffixFromMasked(masked: string): string | null {
  const m = masked.match(/(\d+)$/);
  return m ? m[1] : null;
}

/** Last 4 digits of the masked registry mobile (requires ≥4 trailing digits in the stub). */
function last4FromMasked(masked: string): string | null {
  const suffix = suffixFromMasked(masked);
  if (!suffix || suffix.length < 4) return null;
  return suffix.slice(-4);
}

/**
 * Match **only** on the last 4 digits of the user’s mobile vs the last 4 digits in the CSV `Mobile`
 * column (masked). Other `GovernmentVerificationInput` fields are ignored for matching (optional
 * for display / storage on `ArtisanProfile`).
 *
 * If several rows share the same last-4 suffix, the first row in file order wins.
 */
export function findRegistryMatch(
  input: GovernmentVerificationInput,
): GovernmentRegistryRow | null {
  const mobile = input.govMobile?.trim();
  if (!mobile) {
    govVerifyDebug("findRegistryMatch: no govMobile on input", {});
    return null;
  }

  const userLast4 = lastDigits(mobile, 4);
  if (!userLast4) {
    govVerifyDebug("findRegistryMatch: fewer than 4 digits in mobile after stripping non-digits", {
      raw: mobile.replace(/\D/g, "").length,
    });
    return null;
  }

  const registry = getRegistryRows();

  let rowsWithSameLast4 = 0;
  let matched: GovernmentRegistryRow | null = null;

  for (const row of registry) {
    const regLast4 = last4FromMasked(row.mobile);
    if (regLast4 !== userLast4) continue;
    rowsWithSameLast4++;
    if (!matched) matched = row;
  }

  if (matched) {
    govVerifyDebug("findRegistryMatch: MATCH", {
      userLast4,
      matchedSNo: matched.sNo,
      registryMobileColumn: matched.mobile,
      rowsWithSameLast4,
    });
    return matched;
  }

  govVerifyDebug("findRegistryMatch: NO MATCH", {
    userLast4,
    digitsOnlyLength: mobile.replace(/\D/g, "").length,
    registryRowCount: registry.length,
    rowsWithSameLast4InCsv: rowsWithSameLast4,
    hint:
      rowsWithSameLast4 === 0
        ? "No CSV row has Mobile ending in these 4 digits. Search artist-dataset.csv for your suffix."
        : "Unexpected: rowsWithSameLast4>0 but no matched row (logic bug).",
  });

  return null;
}
