import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductShopAndMarketplace } from "@/components/product-shop-marketplace";
import { getProductForVerification } from "@/lib/product-verification";

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const data = await getProductForVerification(productId);
  if (!data) {
    return { title: "Product not found" };
  }
  return {
    title: `${data.product.name} · Verification`,
    description: data.product.description ?? `Verified listing: ${data.product.name}`,
  };
}

export default async function VerifyPage({ params }: Props) {
  const { productId } = await params;
  const data = await getProductForVerification(productId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="text-sm">
        <Link href="/" className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 hover:text-stone-900">
          ← Marketplace
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Product verification</h1>
        <p className="mt-1 text-sm text-stone-600">Public authenticity details for this listing.</p>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium text-stone-900">{data.product.name}</h2>
        <p className="mt-1 text-sm text-stone-600">{data.product.category}</p>
        {data.product.description ? (
          <p className="mt-3 text-pretty text-stone-800">{data.product.description}</p>
        ) : null}
        <ProductShopAndMarketplace
          shopAddress={data.product.shopAddress}
          marketplaceUrl={data.product.marketplaceUrl}
          className="mt-4 border-t border-stone-100 pt-4"
        />
      </section>

      <section className="rounded-xl border border-stone-100 bg-stone-50/80 p-5 sm:p-6">
        <h3 className="text-xs font-medium uppercase tracking-wide text-stone-500">Artisan</h3>
        <p className="mt-2 text-base text-stone-900">{data.artisan.displayName ?? "—"}</p>
        <p className="mt-1 text-xs text-stone-500">Public ID: {data.artisan.publicId}</p>
      </section>

      {data.media.length > 0 ? (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Proof of authenticity
          </h3>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {data.media.map((m) => (
              <li key={`${m.url}-${m.sortOrder}`}>
                {m.type === "VIDEO" ? (
                  <video
                    src={m.url}
                    controls
                    playsInline
                    className="w-full rounded-lg border border-stone-200 bg-black"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- user-provided media URLs
                  <img
                    src={m.url}
                    alt=""
                    className="max-h-80 w-full rounded-lg border border-stone-200 object-cover"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
