/** @vercel-platform api-blob — multipart upload via lib/storage (Vercel Blob when token set) */
import { auth } from "@/auth";
import { getProductOpsBlockReason } from "@/lib/artisan-product-guard";
import { prisma } from "@/lib/prisma";
import { uploadProductBlob } from "@/lib/storage";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type RouteParams = { params: Promise<{ productId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await getProductOpsBlockReason(session.user.id);
  if (blocked) {
    return NextResponse.json({ error: blocked }, { status: 403 });
  }

  const { productId } = await params;

  const product = await prisma.product.findFirst({
    where: { id: productId, artisanId: session.user.id },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Expected non-empty file" }, { status: 400 });
  }

  try {
    const { url, mediaType } = await uploadProductBlob({
      file,
      userId: session.user.id,
      productId,
    });

    const agg = await prisma.productMedia.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });
    const nextOrder = (agg._max.sortOrder ?? -1) + 1;

    const created = await prisma.productMedia.create({
      data: {
        productId,
        url,
        type: mediaType,
        sortOrder: nextOrder,
      },
    });

    revalidatePath("/artisan");
    revalidatePath(`/artisan/products/${productId}/edit`);
    revalidatePath("/");
    revalidatePath(`/verify/${productId}`);

    return NextResponse.json({
      media: {
        id: created.id,
        url: created.url,
        type: created.type,
        sortOrder: created.sortOrder,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    const status =
      message.includes("not set") || message.includes("BLOB_READ_WRITE_TOKEN") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
