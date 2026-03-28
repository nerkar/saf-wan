import "server-only";

import { put } from "@vercel/blob";

import { getStorageBackend } from "./env";
import type { UploadPublicMediaParams, UploadPublicMediaResult } from "./types";

export type { UploadPublicMediaParams, UploadPublicMediaResult } from "./types";
export { getStorageBackend, isStorageConfigured } from "./env";

/**
 * Upload public-readable media for products (images/video).
 * Use from Server Actions or Route Handlers only — requires `BLOB_READ_WRITE_TOKEN`.
 */
export async function uploadPublicMedia(
  params: UploadPublicMediaParams,
): Promise<UploadPublicMediaResult> {
  if (getStorageBackend() !== "vercel-blob") {
    throw new Error(
      "Object storage is not configured. Set BLOB_READ_WRITE_TOKEN (see docs/integration-platform.md).",
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN!;
  const blob = await put(params.pathname, params.body, {
    access: "public",
    token,
    contentType: params.contentType,
  });

  return { url: blob.url };
}
