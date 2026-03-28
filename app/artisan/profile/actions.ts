"use server";

import { revalidatePath } from "next/cache";
import { verifyArtisanWithGovernment } from "@/lib/government";
import { parseTenDigitIndianMobile } from "@/lib/mobile-validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function updateArtisanProfile(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const userId = await requireUserId();

  const [user, profile, googleAccount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    prisma.artisanProfile.findUnique({ where: { userId } }),
    prisma.account.findFirst({ where: { userId, provider: "google" }, select: { id: true } }),
  ]);

  if (!user?.email || !profile) {
    return { error: "Could not load your profile." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const govState = String(formData.get("govState") ?? "").trim();
  const govDistrict = String(formData.get("govDistrict") ?? "").trim();
  const govCraft = String(formData.get("govCraft") ?? "").trim();
  const govGender = String(formData.get("govGender") ?? "").trim();
  const govMobileRaw = String(formData.get("govMobile") ?? "").trim();

  let govMobile: string | null;
  if (govMobileRaw === "") {
    govMobile = profile.govMobile;
  } else {
    const mobileParsed = parseTenDigitIndianMobile(govMobileRaw);
    if (!mobileParsed.ok) {
      return { error: mobileParsed.message };
    }
    govMobile = mobileParsed.digits;
  }

  if (!govMobile && googleAccount) {
    return {
      error:
        "Add a mobile number for registry verification. The last 4 digits must match the official dataset.",
    };
  }

  const gov = await verifyArtisanWithGovernment({
    email: user.email,
    displayName: displayName || null,
    govState: govState || null,
    govDistrict: govDistrict || null,
    govCraft: govCraft || null,
    govGender: govGender || null,
    govMobile,
    externalPortalId: profile.externalPortalId,
  });

  await prisma.artisanProfile.update({
    where: { userId },
    data: {
      displayName: displayName || null,
      govState: govState || null,
      govDistrict: govDistrict || null,
      govCraft: govCraft || null,
      govGender: govGender || null,
      govMobile,
      verificationStatus: gov.status,
      externalPortalId: gov.externalPortalId ?? undefined,
    },
  });

  revalidatePath("/artisan");
  revalidatePath("/artisan/profile");
  return { success: true };
}
