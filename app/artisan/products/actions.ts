"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import type { MediaType } from "@prisma/client";

function revalidateProduct(productId: string) {
  revalidatePath("/");
  revalidatePath("/artisan");
  revalidatePath(`/artisan/products/${productId}/edit`);
  revalidatePath(`/verify/${productId}`);
}

const MAX_MEDIA_ON_CREATE = 20;

function parseOptionalHttpUrl(
  raw: string,
  fieldLabel: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      return {
        ok: false,
        error: `${fieldLabel} must use http or https.`,
      };
    }
    return { ok: true, value: trimmed };
  } catch {
    return { ok: false, error: `Invalid ${fieldLabel.toLowerCase()}.` };
  }
}

function parseCreateProductMediaJson(
  raw: string,
):
  | { ok: true; items: { url: string; type: MediaType }[] }
  | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid media data." };
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, error: "Invalid media data." };
  }
  if (parsed.length > MAX_MEDIA_ON_CREATE) {
    return {
      ok: false,
      error: `You can add at most ${MAX_MEDIA_ON_CREATE} media items.`,
    };
  }

  const seen = new Set<string>();
  const items: { url: string; type: MediaType }[] = [];

  for (const entry of parsed) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      return { ok: false, error: "Invalid media data." };
    }
    const rec = entry as Record<string, unknown>;
    const url = String(rec.url ?? "").trim();
    const typeRaw = String(rec.type ?? "IMAGE").toUpperCase();
    const mediaType = typeRaw === "VIDEO" ? "VIDEO" : "IMAGE";

    if (!url) {
      continue;
    }

    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        return { ok: false, error: "Media URLs must use http or https." };
      }
    } catch {
      return { ok: false, error: "Invalid media URL." };
    }

    const dedupeKey = `${url}\0${mediaType}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    items.push({ url, type: mediaType });
  }

  return { ok: true, items };
}

export async function createProduct(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const userId = await requireUserId();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const shopAddress = String(formData.get("shopAddress") ?? "").trim();
  const marketplaceUrlRaw = String(formData.get("marketplaceUrl") ?? "").trim();
  const published = formData.get("published") === "on";
  const mediaJson = String(formData.get("mediaItems") ?? "[]");

  if (!name || !category) {
    return { error: "Name and category are required." };
  }

  const marketplaceParsed = parseOptionalHttpUrl(
    marketplaceUrlRaw,
    "Marketplace link",
  );
  if (!marketplaceParsed.ok) {
    return { error: marketplaceParsed.error };
  }

  const mediaParsed = parseCreateProductMediaJson(mediaJson);
  if (!mediaParsed.ok) {
    return { error: mediaParsed.error };
  }
  const mediaItems = mediaParsed.items;

  const created = await prisma.product.create({
    data: {
      artisanId: userId,
      name,
      category,
      description: description || null,
      shopAddress: shopAddress || null,
      marketplaceUrl: marketplaceParsed.value,
      published,
    },
  });

  if (mediaItems.length > 0) {
    await prisma.productMedia.createMany({
      data: mediaItems.map((m, i) => ({
        productId: created.id,
        url: m.url,
        type: m.type,
        sortOrder: i,
      })),
    });
  }

  revalidateProduct(created.id);
  redirect("/artisan");
}

export async function updateProduct(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const userId = await requireUserId();

  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const shopAddress = String(formData.get("shopAddress") ?? "").trim();
  const marketplaceUrlRaw = String(formData.get("marketplaceUrl") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!productId) {
    return { error: "Missing product." };
  }
  if (!name || !category) {
    return { error: "Name and category are required." };
  }

  const marketplaceParsed = parseOptionalHttpUrl(
    marketplaceUrlRaw,
    "Marketplace link",
  );
  if (!marketplaceParsed.ok) {
    return { error: marketplaceParsed.error };
  }

  const updated = await prisma.product.updateMany({
    where: { id: productId, artisanId: userId, archived: false },
    data: {
      name,
      category,
      description: description || null,
      shopAddress: shopAddress || null,
      marketplaceUrl: marketplaceParsed.value,
      published,
    },
  });

  if (updated.count === 0) {
    return { error: "Product not found or access denied." };
  }

  revalidateProduct(productId);
  return {};
}

export async function archiveProduct(productId: string): Promise<{ error?: string }> {
  const userId = await requireUserId();

  const updated = await prisma.product.updateMany({
    where: { id: productId, artisanId: userId, archived: false },
    data: { archived: true, published: false },
  });

  if (updated.count === 0) {
    return { error: "Product not found, already archived, or access denied." };
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
  const userId = await requireUserId();

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
    where: { id: productId, artisanId: userId, archived: false },
  });
  if (!product) {
    return { error: "Product not found, archived, or access denied." };
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
  const userId = await requireUserId();

  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: true },
  });
  if (!media || media.product.artisanId !== userId) {
    return { error: "Media not found or access denied." };
  }
  if (media.product.archived) {
    return { error: "Cannot change media on an archived product." };
  }

  await prisma.productMedia.delete({ where: { id: mediaId } });

  revalidateProduct(media.productId);
  return {};
}

export async function moveProductMedia(
  mediaId: string,
  direction: "up" | "down",
): Promise<{ error?: string }> {
  const userId = await requireUserId();

  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: true },
  });
  if (!media || media.product.artisanId !== userId) {
    return { error: "Media not found or access denied." };
  }
  if (media.product.archived) {
    return { error: "Cannot reorder media on an archived product." };
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
