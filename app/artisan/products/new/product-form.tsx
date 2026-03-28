"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { createProduct } from "@/app/artisan/products/actions";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_VIDEO_BYTES,
} from "@/lib/media-upload-limits";

const initial: { error?: string } = {};

const FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

export type ProductFormProps = {
  blobUploadEnabled: boolean;
};

type PendingMedia = {
  clientId: string;
  url: string;
  type: "IMAGE" | "VIDEO";
};

function clientId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${Math.random()}`;
}

export function ProductForm({ blobUploadEnabled }: ProductFormProps) {
  const [state, formAction] = useActionState(createProduct, initial);
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [urlFieldError, setUrlFieldError] = useState<string | null>(null);

  const filePickRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);
  const pendingCountRef = useRef(0);

  useEffect(() => {
    pendingCountRef.current = pending.length;
  }, [pending.length]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (pendingCountRef.current >= 20) {
        setUploadError("Maximum 20 media items.");
        return;
      }
      setUploadError(null);

      const isVideo = file.type.startsWith("video/");
      const max = isVideo ? MAX_PRODUCT_VIDEO_BYTES : MAX_PRODUCT_IMAGE_BYTES;
      if (file.size > max) {
        setUploadError(
          `File too large (max ${Math.round(max / (1024 * 1024))} MB for ${isVideo ? "video" : "images"}).`,
        );
        return;
      }

      if (!blobUploadEnabled) {
        setUploadError(
          "File upload requires BLOB_READ_WRITE_TOKEN. Add media by URL or configure Vercel Blob.",
        );
        return;
      }

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/artisan/draft-media", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          url?: string;
          mediaType?: "IMAGE" | "VIDEO";
        };
        if (!res.ok || !data.url || !data.mediaType) {
          setUploadError(data.error ?? "Upload failed.");
          return;
        }
        setPending((prev) => [
          ...prev,
          { clientId: clientId(), url: data.url!, type: data.mediaType! },
        ]);
      } finally {
        setUploading(false);
      }
    },
    [blobUploadEnabled],
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    void (async () => {
      for (const f of Array.from(files)) {
        await uploadFile(f);
      }
    })();
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    void (async () => {
      for (const f of Array.from(files)) {
        await uploadFile(f);
      }
    })();
  };

  function addMediaByUrl() {
    setUrlFieldError(null);
    const url = urlInput.trim();
    if (!url) {
      setUrlFieldError("Enter a URL.");
      return;
    }
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        setUrlFieldError("Use an http(s) URL.");
        return;
      }
    } catch {
      setUrlFieldError("Invalid URL.");
      return;
    }
    if (pending.length >= 20) {
      setUrlFieldError("Maximum 20 media items.");
      return;
    }
    const dedupe = pending.some((p) => p.url === url && p.type === urlType);
    if (dedupe) {
      setUrlFieldError("That URL is already added.");
      return;
    }
    setPending((prev) => [...prev, { clientId: clientId(), url, type: urlType }]);
    setUrlInput("");
  }

  function removePending(clientIdRemove: string) {
    setPending((prev) => prev.filter((p) => p.clientId !== clientIdRemove));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="mediaItems" value={JSON.stringify(pending)} />

      {state?.error ? <p className="craft-alert craft-alert-error">{state.error}</p> : null}

      <div>
        <label htmlFor="name" className="craft-label">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          className="craft-input"
        />
      </div>
      <div>
        <label htmlFor="category" className="craft-label">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          className="craft-input"
        />
      </div>
      <div>
        <label htmlFor="description" className="craft-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="craft-input min-h-[5.5rem]"
        />
      </div>
      <div>
        <label htmlFor="shopAddress" className="craft-label">
          Physical shop address <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <textarea
          id="shopAddress"
          name="shopAddress"
          rows={2}
          placeholder="Street, city, region…"
          className="craft-input min-h-[4.5rem]"
        />
      </div>
      <div>
        <label htmlFor="marketplaceUrl" className="craft-label">
          Online marketplace link <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <input
          id="marketplaceUrl"
          name="marketplaceUrl"
          type="url"
          placeholder="https://…"
          className="craft-input"
        />
      </div>

      <fieldset className="craft-section space-y-4 p-5 sm:p-6">
        <legend className="px-1 text-sm font-semibold text-[var(--craft-ink)]">Media (optional)</legend>
        <p className="text-sm leading-relaxed text-[var(--craft-muted)]">
          Add images or videos by link, from your device, or with your camera. Order matches display on
          the verification page; you can reorder after saving from the edit screen.
        </p>

        {pending.length > 0 ? (
          <ul className="space-y-2">
            {pending.map((m, i) => (
              <li
                key={m.clientId}
                className="flex items-start gap-3 rounded-lg border border-[var(--craft-border)] bg-[var(--craft-surface)] p-3 text-sm shadow-sm"
              >
                <div className="shrink-0 overflow-hidden rounded border border-stone-100">
                  {m.type === "VIDEO" ? (
                    <video src={m.url} className="h-16 w-20 object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- user-provided preview
                    <img src={m.url} alt="" className="h-16 w-20 object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-stone-800">
                    {m.type} #{i + 1}
                  </p>
                  <p className="truncate text-xs text-stone-500">{m.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removePending(m.clientId)}
                  className="craft-btn-secondary shrink-0 px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-stone-500">No media added yet.</p>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-700">Add by URL</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="new-media-url" className="sr-only">
                Media URL
              </label>
              <input
                id="new-media-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://…"
                className="craft-input craft-input-sm w-full"
              />
            </div>
            <select
              value={urlType}
              onChange={(e) => setUrlType(e.target.value === "VIDEO" ? "VIDEO" : "IMAGE")}
              className="craft-input craft-input-sm w-full sm:w-auto"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
            <button
              type="button"
              onClick={addMediaByUrl}
              className="craft-btn-secondary px-4 py-2 text-sm font-medium"
            >
              Add URL
            </button>
          </div>
          {urlFieldError ? <p className="text-xs text-red-700">{urlFieldError}</p> : null}
        </div>

        {blobUploadEnabled ? (
          <>
            <div
              role="button"
              tabIndex={0}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragActive(false);
                }
              }}
              onDrop={onDrop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  filePickRef.current?.click();
                }
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-[var(--craft-accent)] bg-[var(--craft-accent-soft)]"
                  : "border-[var(--craft-border-strong)] bg-[var(--craft-surface)] hover:border-[var(--craft-accent)]"
              }`}
              onClick={() => filePickRef.current?.click()}
            >
              <p className="text-sm font-medium text-[var(--craft-ink)]">Drag and drop files here</p>
              <p className="mt-1 text-xs text-[var(--craft-muted)]">or click to choose — images up to 5 MB, video up to 50 MB</p>
            </div>

            <input
              ref={filePickRef}
              type="file"
              accept={FILE_ACCEPT}
              multiple
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              disabled={uploading}
              onChange={onFileInputChange}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => filePickRef.current?.click()}
                className="craft-btn-secondary px-3 py-2 text-sm disabled:opacity-50"
              >
                Choose files
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraPhotoRef.current?.click()}
                className="craft-btn-secondary px-3 py-2 text-sm disabled:opacity-50"
              >
                Take photo
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraVideoRef.current?.click()}
                className="craft-btn-secondary px-3 py-2 text-sm disabled:opacity-50"
              >
                Record video
              </button>
            </div>

            <input
              ref={cameraPhotoRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              disabled={uploading}
              onChange={onFileInputChange}
            />
            <input
              ref={cameraVideoRef}
              type="file"
              accept="video/*"
              capture="environment"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              disabled={uploading}
              onChange={onFileInputChange}
            />
          </>
        ) : (
          <p className="craft-alert craft-alert-warn">
            File and camera uploads need{" "}
            <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code> (Vercel Blob). You can
            still add media using URLs above.
          </p>
        )}

        {uploading ? <p className="text-xs text-stone-600">Uploading…</p> : null}
        {uploadError ? <p className="text-xs text-red-700">{uploadError}</p> : null}
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--craft-border)] bg-[var(--craft-surface-muted)]/80 px-4 py-3 text-sm text-[var(--craft-ink)] transition-colors hover:bg-[var(--craft-surface-muted)]">
        <input
          type="checkbox"
          name="published"
          className="h-4 w-4 rounded border-[var(--craft-border-strong)] text-[var(--craft-accent)] focus:ring-[var(--craft-accent)]"
        />
        Published (visible on home &amp; verifiable)
      </label>
      <button type="submit" className="craft-btn-primary w-full min-h-[48px] text-base">
        Save product
      </button>
    </form>
  );
}
