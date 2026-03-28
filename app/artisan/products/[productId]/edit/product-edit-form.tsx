"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addProductMediaFromUrl,
  archiveProduct,
  moveProductMedia,
  removeProductMedia,
  updateProduct,
} from "@/app/artisan/products/actions";

export type ProductEditFormProps = {
  product: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    shopAddress: string | null;
    marketplaceUrl: string | null;
    published: boolean;
    media: { id: string; url: string; type: "IMAGE" | "VIDEO"; sortOrder: number }[];
  };
  blobUploadEnabled: boolean;
};

const initial: { error?: string } = {};

export function ProductEditForm({ product, blobUploadEnabled }: ProductEditFormProps) {
  const router = useRouter();
  const [updateState, updateAction] = useActionState(updateProduct, initial);
  const [urlState, urlAction] = useActionState(addProductMediaFromUrl, initial);
  const [pendingArchive, startArchive] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/products/${product.id}/media`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }
      router.refresh();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function confirmAndArchive() {
    if (
      !window.confirm(
        "Archive this product? It will be hidden from your dashboard and the public site. The record stays in the system.",
      )
    ) {
      return;
    }
    startArchive(async () => {
      await archiveProduct(product.id);
    });
  }

  return (
    <div className="space-y-8">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="productId" value={product.id} />
        {updateState?.error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{updateState.error}</p>
        ) : null}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product.name}
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
            defaultValue={product.category}
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
            defaultValue={product.description ?? ""}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="shopAddress" className="block text-sm font-medium text-stone-700">
            Physical shop address <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <textarea
            id="shopAddress"
            name="shopAddress"
            rows={2}
            defaultValue={product.shopAddress ?? ""}
            placeholder="Street, city, region…"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="marketplaceUrl" className="block text-sm font-medium text-stone-700">
            Online marketplace link <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input
            id="marketplaceUrl"
            name="marketplaceUrl"
            type="url"
            defaultValue={product.marketplaceUrl ?? ""}
            placeholder="https://…"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-800">
          <input
            type="checkbox"
            name="published"
            defaultChecked={product.published}
            className="rounded border-stone-300"
          />
          Published (visible on home &amp; verifiable)
        </label>
        <button
          type="submit"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Save changes
        </button>
      </form>

      <section className="border-t border-stone-200 pt-8">
        <h2 className="text-lg font-medium text-stone-900">Media gallery</h2>
        <p className="mt-1 text-sm text-stone-600">
          Reorder items for the public verification page. Images and short demo videos are shown to
          buyers.
        </p>

        {product.media.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No media yet. Add a file or URL below.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {product.media.map((m, i) => (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:flex-row sm:items-start"
              >
                <div className="shrink-0 overflow-hidden rounded-md border border-stone-100 sm:w-40">
                  {m.type === "VIDEO" ? (
                    <video src={m.url} className="h-28 w-full object-cover" controls muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- gallery of user URLs
                    <img src={m.url} alt="" className="h-28 w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-xs text-stone-500">{m.url}</p>
                  <p className="text-xs text-stone-400">
                    {m.type} · order {m.sortOrder}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <form>
                      <button
                        type="submit"
                        formAction={async () => {
                          await moveProductMedia(m.id, "up");
                        }}
                        disabled={i === 0}
                        className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-800 disabled:opacity-40"
                      >
                        Up
                      </button>
                    </form>
                    <form>
                      <button
                        type="submit"
                        formAction={async () => {
                          await moveProductMedia(m.id, "down");
                        }}
                        disabled={i === product.media.length - 1}
                        className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-800 disabled:opacity-40"
                      >
                        Down
                      </button>
                    </form>
                    <form>
                      <button
                        type="submit"
                        formAction={async () => {
                          await removeProductMedia(m.id);
                        }}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-800 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 space-y-4">
          {blobUploadEnabled ? (
            <div>
              <label className="block text-sm font-medium text-stone-700">Upload file</label>
              <p className="mt-0.5 text-xs text-stone-500">
                Images up to 5 MB; video up to 50 MB (MP4, WebM, MOV).
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                className="mt-2 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                disabled={uploading}
                onChange={onFileChange}
              />
              {uploading ? (
                <p className="mt-1 text-xs text-stone-500">Uploading…</p>
              ) : null}
              {uploadError ? (
                <p className="mt-1 text-xs text-red-700">{uploadError}</p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              File upload is disabled locally: set <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code>{" "}
              (Vercel Blob). You can still attach media via HTTPS URL below.
            </p>
          )}

          <form action={urlAction} className="space-y-2 rounded-lg border border-dashed border-stone-300 p-4">
            <input type="hidden" name="productId" value={product.id} />
            <p className="text-sm font-medium text-stone-800">Add media by URL</p>
            {urlState?.error ? (
              <p className="text-sm text-red-700">{urlState.error}</p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="media-url" className="sr-only">
                  Media URL
                </label>
                <input
                  id="media-url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://…"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900"
                />
              </div>
              <div>
                <label htmlFor="media-type" className="sr-only">
                  Type
                </label>
                <select
                  id="media-type"
                  name="mediaType"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 sm:w-auto"
                  defaultValue="IMAGE"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-md bg-stone-200 px-3 py-2 text-sm font-medium text-stone-900 hover:bg-stone-300"
              >
                Add URL
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-t border-amber-100 pt-8">
        <h2 className="text-lg font-medium text-stone-900">Archive</h2>
        <p className="mt-1 text-sm text-stone-600">
          Archiving hides this product from your dashboard and from the public marketplace and
          verification page. Media and details remain stored; contact support if you need the listing
          restored.
        </p>
        <button
          type="button"
          onClick={confirmAndArchive}
          disabled={pendingArchive}
          className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-50"
        >
          {pendingArchive ? "Archiving…" : "Archive"}
        </button>
      </section>
    </div>
  );
}
