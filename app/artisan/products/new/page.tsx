import Link from "next/link";
import { isBlobStorageConfigured } from "@/lib/storage";
import { ProductForm } from "./product-form";

export default function NewProductPage() {
  const blobUploadEnabled = isBlobStorageConfigured();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/artisan" className="text-sm text-stone-600 hover:text-stone-900">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">New product</h1>
        <p className="mt-1 text-sm text-stone-600">
          Add details and optional media (URL, file upload, drag-and-drop, or camera on supported
          devices). Check &quot;Published&quot; to list it on the home page.
        </p>
      </div>

      <ProductForm blobUploadEnabled={blobUploadEnabled} />
    </div>
  );
}
