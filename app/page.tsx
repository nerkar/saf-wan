import Link from "next/link";
import { ProductShopAndMarketplace } from "@/components/product-shop-marketplace";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { published: true, archived: false },
    orderBy: { createdAt: "desc" },
    include: {
      artisan: { include: { artisanProfile: true } },
      media: {
        where: { type: "IMAGE" },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    take: 24,
  });

  const byCategory = products.reduce(
    (acc, p) => {
      const c = p.category || "Uncategorized";
      if (!acc[c]) acc[c] = [];
      acc[c].push(p);
      return acc;
    },
    {} as Record<string, typeof products>,
  );

  return (
    <div className="space-y-12">
      <section className="craft-card-elevated overflow-hidden">
        <div className="border-l-4 border-[var(--craft-accent)] bg-gradient-to-br from-[var(--craft-surface)] to-[var(--craft-surface-muted)] px-6 py-7 sm:px-8 sm:py-8">
          <h1 className="craft-heading text-3xl sm:text-4xl">Saf-Wan</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--craft-muted)] sm:text-base">
            Browse published listings. Scan a product QR code or open a verification link to see
            artisan details and proof of authenticity.
          </p>
        </div>
      </section>

      {Object.keys(byCategory).length === 0 ? (
        <section className="craft-card p-6 text-sm text-[var(--craft-muted)]">
          No published products yet. Sign in as an artisan and publish a product to see it here.
        </section>
      ) : (
        Object.entries(byCategory).map(([category, items]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[var(--craft-border)] pb-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--craft-accent)]" aria-hidden />
              <h2 className="craft-heading text-xl">{category}</h2>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {items.map((p) => {
                const thumbUrl = p.media[0]?.url;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/verify/${p.id}`}
                      className="craft-list-row flex gap-3 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[var(--craft-ink)]">{p.name}</span>
                        <span className="mt-1 block text-sm leading-snug text-[var(--craft-muted)] line-clamp-2">
                          {p.description || "No description."}
                        </span>
                        <span className="mt-2 block text-xs text-stone-500">
                          Artisan:{" "}
                          {p.artisan.artisanProfile?.displayName ?? p.artisan.name ?? p.artisan.id}
                        </span>
                        <ProductShopAndMarketplace
                          shopAddress={p.shopAddress}
                          marketplaceUrl={p.marketplaceUrl}
                          className="mt-2"
                        />
                      </div>
                      {thumbUrl ? (
                        <div className="relative h-20 w-20 shrink-0 self-start overflow-hidden rounded-lg border border-[var(--craft-border)] bg-[var(--craft-surface-muted)] sm:h-24 sm:w-24">
                          {/* eslint-disable-next-line @next/next/no-img-element -- product media URLs from storage */}
                          <img
                            src={thumbUrl}
                            alt={`${p.name} thumbnail`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
