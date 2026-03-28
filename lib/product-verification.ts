import { prisma } from "@/lib/prisma";

/** Public-safe payload for `/verify/[productId]` — no secrets. */
export type ProductVerificationPayload = {
  product: {
    id: string;
    name: string;
    category: string;
    description: string | null;
  };
  artisan: {
    displayName: string | null;
    publicId: string;
  };
  media: { url: string; type: "IMAGE" | "VIDEO"; sortOrder: number }[];
};

export async function getProductForVerification(
  productId: string,
): Promise<ProductVerificationPayload | null> {
  const product = await prisma.product.findFirst({
    where: { id: productId, published: true },
    include: {
      artisan: {
        include: { artisanProfile: true },
      },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) return null;

  return {
    product: {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
    },
    artisan: {
      displayName:
        product.artisan.artisanProfile?.displayName ?? product.artisan.name,
      publicId: product.artisan.id,
    },
    media: product.media.map((m) => ({
      url: m.url,
      type: m.type,
      sortOrder: m.sortOrder,
    })),
  };
}
