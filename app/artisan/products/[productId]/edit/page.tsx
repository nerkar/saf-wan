import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isVerifiedForProductOps } from "@/lib/artisan-product-guard";
import { prisma } from "@/lib/prisma";
import { isBlobStorageConfigured } from "@/lib/storage";
import { ProductEditForm } from "./product-edit-form";

type Props = { params: Promise<{ productId: string }> };

export default async function EditProductPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!isVerifiedForProductOps(profile?.verificationStatus)) {
    redirect("/artisan");
  }

  const { productId } = await params;
  const product = await prisma.product.findFirst({
    where: { id: productId, artisanId: session.user.id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    notFound();
  }

  const blobUploadEnabled = isBlobStorageConfigured();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/artisan" className="text-sm text-stone-600 hover:text-stone-900">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Edit product</h1>
        <p className="mt-1 text-sm text-stone-600">
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
