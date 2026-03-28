import { notFound } from "next/navigation";
import { getProductForVerification } from "@/lib/product-verification";

type Props = { params: Promise<{ productId: string }> };

export default async function VerifyPage({ params }: Props) {
  const { productId } = await params;
  const data = await getProductForVerification(productId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Product verification</h1>
        <p className="mt-1 text-sm text-stone-600">Public authenticity details for this listing.</p>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-stone-900">{data.product.name}</h2>
        <p className="text-sm text-stone-600">{data.product.category}</p>
        {data.product.description ? (
          <p className="mt-3 text-stone-800">{data.product.description}</p>
        ) : null}
      </section>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-stone-500">Artisan</h3>
        <p className="mt-1 text-stone-900">{data.artisan.displayName ?? "—"}</p>
        <p className="text-xs text-stone-500">ID: {data.artisan.publicId}</p>
      </section>

      {data.media.length > 0 ? (
        <section>
          <h3 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Proof of authenticity
          </h3>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {data.media.map((m) => (
              <li key={`${m.url}-${m.sortOrder}`}>
                {m.type === "VIDEO" ? (
                  <video src={m.url} controls className="w-full rounded-lg border border-stone-200" />
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
