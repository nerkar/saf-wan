/** @vercel-platform blob — backend id vercel-blob when BLOB_READ_WRITE_TOKEN set */
import "server-only";

export type StorageBackend = "vercel-blob" | "none";

/**
 * Resolved from env (no network). Extend with `s3` when an S3 client is added.
 */
export function getStorageBackend(): StorageBackend {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return "vercel-blob";
  }
  return "none";
}

export function isStorageConfigured(): boolean {
  return getStorageBackend() !== "none";
}
