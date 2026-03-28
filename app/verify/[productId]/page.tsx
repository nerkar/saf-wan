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
    <div className="space-y-8 pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="text-sm">
        <Link href="/" className="craft-nav-link inline-flex font-medium">
          ← Marketplace
        </Link>
      </nav>

      <header className="craft-section px-5 py-6 sm:px-8 sm:py-7">
        <h1 className="craft-heading text-2xl tracking-tight sm:text-3xl">Product verification</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--craft-muted)]">
          Public authenticity details for this listing.
        </p>
      </header>

      <section className="craft-card-elevated p-5 sm:p-7">
        <h2 className="craft-heading text-xl">{data.product.name}</h2>
        <p className="mt-1 text-sm text-[var(--craft-muted)]">{data.product.category}</p>
        {data.product.description ? (
          <p className="mt-4 text-pretty leading-relaxed text-[var(--craft-ink)]">{data.product.description}</p>
        ) : null}
        <ProductShopAndMarketplace
          shopAddress={data.product.shopAddress}
          marketplaceUrl={data.product.marketplaceUrl}
          className="mt-5 border-t border-[var(--craft-border)] pt-5"
        />
      </section>

      <section className="craft-card-elevated bg-[var(--craft-surface-muted)] p-5 sm:p-7">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--craft-muted)]">
          Artisan
        </h3>
        <p className="mt-3 text-lg text-[var(--craft-ink)]">{data.artisan.displayName ?? "—"}</p>
        <p className="mt-1 text-xs text-stone-500">Public ID: {data.artisan.publicId}</p>
      </section>

      {data.media.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--craft-border)] pb-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--craft-accent)]" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--craft-muted)]">
              Proof of authenticity
            </h3>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.media.map((m) => (
              <li
                key={`${m.url}-${m.sortOrder}`}
                className="overflow-hidden rounded-xl border border-[var(--craft-border)] bg-[var(--craft-surface)] shadow-sm"
              >
                {m.type === "VIDEO" ? (
                  <video
                    src={m.url}
                    controls
                    playsInline
                    className="w-full bg-black"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- user-provided media URLs
                  <img
                    src={m.url}
                    alt=""
                    className="max-h-80 w-full object-cover"
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
