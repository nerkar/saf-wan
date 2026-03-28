"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { verifyArtisanWithGovernment } from "@/lib/government";
import { prisma } from "@/lib/prisma";

export async function registerArtisan(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

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
        },
      },
    },
  });

  const gov = await verifyArtisanWithGovernment({
    email,
    displayName: name || null,
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
