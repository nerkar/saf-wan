import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { published: true, archived: false },
    orderBy: { createdAt: "desc" },
    include: {
      artisan: { include: { artisanProfile: true } },
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
    <div className="space-y-10">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Handicraft verification</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Browse published listings. Scan a product QR code or open a verification link to see
          artisan details and proof of authenticity.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          <Link href="/login" className="font-medium text-stone-800 underline">
            Artisan login
          </Link>{" "}
          to register products and download QR codes.
        </p>
      </section>

      {Object.keys(byCategory).length === 0 ? (
        <p className="text-sm text-stone-600">
          No published products yet. Sign in as an artisan and publish a product to see it here.
        </p>
      ) : (
        Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-medium text-stone-900">{category}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/verify/${p.id}`}
                    className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300"
                  >
                    <span className="font-medium text-stone-900">{p.name}</span>
                    <span className="mt-1 block text-sm text-stone-600 line-clamp-2">
                      {p.description || "No description."}
                    </span>
                    <span className="mt-2 block text-xs text-stone-500">
                      Artisan:{" "}
                      {p.artisan.artisanProfile?.displayName ?? p.artisan.name ?? p.artisan.id}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
