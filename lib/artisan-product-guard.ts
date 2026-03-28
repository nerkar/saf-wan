import type { VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** User-facing message when product mutations are blocked. */
export const PRODUCT_OPS_BLOCKED_MESSAGE =
  "Your account must match the government handicrafts registry before you can add or edit products.";

export function isVerifiedForProductOps(status: VerificationStatus | null | undefined): boolean {
  return status === "VERIFIED";
}

/** Returns `null` if the artisan may create/update products and media. */
export async function getProductOpsBlockReason(userId: string): Promise<string | null> {
  const profile = await prisma.artisanProfile.findUnique({ where: { userId } });
  if (!profile) return "Artisan profile not found.";
  if (isVerifiedForProductOps(profile.verificationStatus)) return null;
  return PRODUCT_OPS_BLOCKED_MESSAGE;
}
