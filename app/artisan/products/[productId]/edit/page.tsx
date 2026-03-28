import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { isBlobStorageConfigured } from "@/lib/storage";
import { ProductEditForm } from "./product-edit-form";

type Props = { params: Promise<{ productId: string }> };

export default async function EditProductPage({ params }: Props) {
  const userId = await requireUserId();

  const { productId } = await params;
  const product = await prisma.product.findFirst({
    where: { id: productId, artisanId: userId, archived: false },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    notFound();
  }

  const blobUploadEnabled = isBlobStorageConfigured();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="craft-card-elevated p-6 sm:p-8">
        <Link href="/artisan" className="craft-nav-link -ml-1 inline-flex text-sm">
          ← Dashboard
        </Link>
        <h1 className="craft-heading mt-4 text-2xl sm:text-3xl">Edit product</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--craft-muted)]">
          Update details and manage media. Published products appear on the home page and on the public
          verification URL.
        </p>
      </div>

      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          shopAddress: product.shopAddress,
          marketplaceUrl: product.marketplaceUrl,
          published: product.published,
          media: product.media.map((m) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            sortOrder: m.sortOrder,
          })),
        }}
        blobUploadEnabled={blobUploadEnabled}
      />
    </div>
  );
}
