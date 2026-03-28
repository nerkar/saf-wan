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

      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-stone-700">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>

      <fieldset className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
        <legend className="px-1 text-sm font-medium text-stone-900">Media (optional)</legend>
        <p className="text-sm text-stone-600">
          Add images or videos by link, from your device, or with your camera. Order matches display on
          the verification page; you can reorder after saving from the edit screen.
        </p>

        {pending.length > 0 ? (
          <ul className="space-y-2">
            {pending.map((m, i) => (
              <li
                key={m.clientId}
                className="flex items-start gap-3 rounded-md border border-stone-200 bg-white p-2 text-sm"
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
                  className="shrink-0 rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-100"
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
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <select
              value={urlType}
              onChange={(e) => setUrlType(e.target.value === "VIDEO" ? "VIDEO" : "IMAGE")}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 sm:w-auto"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
            <button
              type="button"
              onClick={addMediaByUrl}
              className="rounded-md bg-stone-200 px-3 py-2 text-sm font-medium text-stone-900 hover:bg-stone-300"
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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragActive
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-300 bg-white hover:border-stone-400"
              }`}
              onClick={() => filePickRef.current?.click()}
            >
              <p className="text-sm font-medium text-stone-800">Drag and drop files here</p>
              <p className="mt-1 text-xs text-stone-500">or click to choose — images up to 5 MB, video up to 50 MB</p>
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
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 hover:bg-stone-50 disabled:opacity-50"
              >
                Choose files
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraPhotoRef.current?.click()}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 hover:bg-stone-50 disabled:opacity-50"
              >
                Take photo
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraVideoRef.current?.click()}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 hover:bg-stone-50 disabled:opacity-50"
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
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            File and camera uploads need{" "}
            <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code> (Vercel Blob). You can
            still add media using URLs above.
          </p>
        )}

        {uploading ? <p className="text-xs text-stone-600">Uploading…</p> : null}
        {uploadError ? <p className="text-xs text-red-700">{uploadError}</p> : null}
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-stone-800">
        <input type="checkbox" name="published" className="rounded border-stone-300" />
        Published (visible on home &amp; verifiable)
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-stone-900 px-4 py-2 text-white hover:bg-stone-800"
      >
        Save product
      </button>
    </form>
  );
}
