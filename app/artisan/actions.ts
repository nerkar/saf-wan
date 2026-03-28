"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createProduct(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const published = formData.get("published") === "on";
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();

  if (!name || !category) {
    return { error: "Name and category are required." };
  }

  await prisma.product.create({
    data: {
      artisanId: session.user.id,
      name,
      category,
      description: description || null,
      published,
      media: mediaUrl
        ? {
            create: {
              url: mediaUrl,
              type: "IMAGE",
              sortOrder: 0,
            },
          }
        : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/artisan");
  redirect("/artisan");
}
