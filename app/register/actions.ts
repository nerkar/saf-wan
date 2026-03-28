"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { verifyArtisanWithGovernment } from "@/lib/government";
import { parseTenDigitIndianMobile } from "@/lib/mobile-validation";
import { prisma } from "@/lib/prisma";

export async function registerArtisan(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const govState = String(formData.get("govState") ?? "").trim();
  const govDistrict = String(formData.get("govDistrict") ?? "").trim();
  const govCraft = String(formData.get("govCraft") ?? "").trim();
  const govGender = String(formData.get("govGender") ?? "").trim();
  const govMobileRaw = String(formData.get("govMobile") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!govMobileRaw) {
    return { error: "Mobile number is required for registry verification (last 4 digits must match)." };
  }

  const mobileParsed = parseTenDigitIndianMobile(govMobileRaw);
  if (!mobileParsed.ok) {
    return { error: mobileParsed.message };
  }
  const govMobile = mobileParsed.digits;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: hash,
      artisanProfile: {
        create: {
          displayName: name || null,
          verificationStatus: "PENDING",
          govState: govState || null,
          govDistrict: govDistrict || null,
          govCraft: govCraft || null,
          govGender: govGender || null,
          govMobile,
        },
      },
    },
  });

  const gov = await verifyArtisanWithGovernment({
    email,
    displayName: name || null,
    govState: govState || null,
    govDistrict: govDistrict || null,
    govCraft: govCraft || null,
    govGender: govGender || null,
    govMobile,
  });

  await prisma.artisanProfile.update({
    where: { userId: user.id },
    data: {
      verificationStatus: gov.status,
      externalPortalId: gov.externalPortalId ?? undefined,
    },
  });

  redirect("/login?registered=1");
}
