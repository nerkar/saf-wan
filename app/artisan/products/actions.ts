"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProductOpsBlockReason } from "@/lib/artisan-product-guard";
import { prisma } from "@/lib/prisma";
import type { MediaType } from "@prisma/client";

function revalidateProduct(productId: string) {
  revalidatePath("/");
  revalidatePath("/artisan");
  revalidatePath(`/artisan/products/${productId}/edit`);
  revalidatePath(`/verify/${productId}`);
}

export async function createProduct(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return { error: blocked };
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const published = formData.get("published") === "on";
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();

  if (!name || !category) {
    return { error: "Name and category are required." };
  }

  const created = await prisma.product.create({
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

  revalidateProduct(created.id);
  redirect("/artisan");
}

export async function updateProduct(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return { error: blocked };
  }

  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!productId) {
    return { error: "Missing product." };
  }
  if (!name || !category) {
    return { error: "Name and category are required." };
  }

  const updated = await prisma.product.updateMany({
    where: { id: productId, artisanId: session.user.id },
    data: {
      name,
      category,
      description: description || null,
      published,
    },
  });

  if (updated.count === 0) {
    return { error: "Product not found or access denied." };
  }

  revalidateProduct(productId);
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return { error: blocked };
  }

  const deleted = await prisma.product.deleteMany({
    where: { id: productId, artisanId: session.user.id },
  });

  if (deleted.count === 0) {
    return { error: "Product not found or access denied." };
  }

  revalidatePath("/");
  revalidatePath("/artisan");
  revalidatePath(`/verify/${productId}`);
  redirect("/artisan");
}

export async function addProductMediaFromUrl(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return { error: blocked };
  }

  const productId = String(formData.get("productId") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const typeRaw = String(formData.get("mediaType") ?? "IMAGE").toUpperCase();
  const mediaType = (typeRaw === "VIDEO" ? "VIDEO" : "IMAGE") as MediaType;

  if (!productId || !url) {
    return { error: "Product and URL are required." };
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { error: "URL must be http(s)." };
    }
  } catch {
    return { error: "Invalid URL." };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, artisanId: session.user.id },
  });
  if (!product) {
    return { error: "Product not found or access denied." };
  }

  const agg = await prisma.productMedia.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const nextOrder = (agg._max.sortOrder ?? -1) + 1;

  await prisma.productMedia.create({
    data: {
      productId,
      url,
      type: mediaType,
      sortOrder: nextOrder,
    },
  });

  revalidateProduct(productId);
  return {};
}

export async function removeProductMedia(mediaId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return { error: blocked };
  }

  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: true },
  });
  if (!media || media.product.artisanId !== session.user.id) {
    return { error: "Media not found or access denied." };
  }

  await prisma.productMedia.delete({ where: { id: mediaId } });

  revalidateProduct(media.productId);
  return {};
}

export async function moveProductMedia(
  mediaId: string,
  direction: "up" | "down",
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return { error: blocked };
  }

  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: true },
  });
  if (!media || media.product.artisanId !== session.user.id) {
    return { error: "Media not found or access denied." };
  }

  const siblings = await prisma.productMedia.findMany({
    where: { productId: media.productId },
    orderBy: { sortOrder: "asc" },
  });
  const idx = siblings.findIndex((m) => m.id === mediaId);
  if (idx < 0) return { error: "Invalid state." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) {
    return {};
  }

  const a = siblings[idx];
  const b = siblings[swapIdx];

  await prisma.$transaction([
    prisma.productMedia.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.productMedia.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);

  revalidateProduct(media.productId);
  return {};
}
