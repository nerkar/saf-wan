import Link from "next/link";
import { isBlobStorageConfigured } from "@/lib/storage";
import { ProductForm } from "./product-form";

export default function NewProductPage() {
  const blobUploadEnabled = isBlobStorageConfigured();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="craft-card-elevated p-6 sm:p-8">
        <Link href="/artisan" className="craft-nav-link -ml-1 inline-flex text-sm">
          ← Dashboard
        </Link>
        <h1 className="craft-heading mt-4 text-2xl sm:text-3xl">New product</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--craft-muted)]">
          Add details and optional media (URL, file upload, drag-and-drop, or camera on supported
          devices). Check &quot;Published&quot; to list it on the home page.
        </p>
      </div>

      <div className="craft-card p-6 sm:p-8">
        <ProductForm blobUploadEnabled={blobUploadEnabled} />
      </div>
    </div>
  );
}
