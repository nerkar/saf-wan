/** @vercel-platform blob — @vercel/blob; env BLOB_READ_WRITE_TOKEN; see docs/vercel-platform-touchpoints.md */
import { put } from "@vercel/blob";
import type { MediaType } from "@prisma/client";

/** Demo caps — tune for production CDN/transcoding. */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_VIDEO_BYTES = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function detectMediaType(file: File): MediaType | null {
  const t = file.type.toLowerCase();
  if (t.startsWith("image/") && ALLOWED_IMAGE_TYPES.has(t)) return "IMAGE";
  if (t.startsWith("video/") && ALLOWED_VIDEO_TYPES.has(t)) return "VIDEO";
  return null;
}

export function maxBytesForMediaType(type: MediaType): number {
  return type === "VIDEO" ? MAX_PRODUCT_VIDEO_BYTES : MAX_PRODUCT_IMAGE_BYTES;
}

/**
 * Uploads a file to Vercel Blob under a per-artisan, per-product prefix.
 * Server-only; requires `BLOB_READ_WRITE_TOKEN`.
 */
export async function uploadProductBlob(params: {
  file: File;
  userId: string;
  productId: string;
}): Promise<{ url: string; mediaType: MediaType }> {
  if (!isBlobStorageConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Configure Vercel Blob for uploads, or add media by HTTPS URL.",
    );
  }

  const mediaType = detectMediaType(params.file);
  if (!mediaType) {
    throw new Error(
      "Unsupported type. Use JPEG, PNG, WebP, or GIF for images; MP4, WebM, or MOV for video.",
    );
  }

  const max = maxBytesForMediaType(mediaType);
  if (params.file.size > max) {
    throw new Error(
      `File too large (max ${Math.round(max / (1024 * 1024))} MB for ${mediaType === "VIDEO" ? "video" : "images"}).`,
    );
  }

  const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload";
  const pathname = `products/${params.userId}/${params.productId}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, params.file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { url: blob.url, mediaType };
}
