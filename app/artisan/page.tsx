import Link from "next/link";
import { VerificationBanner } from "@/components/artisan/verification-banner";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function ArtisanDashboardPage() {
  const userId = await requireUserId();

  const profile = await prisma.artisanProfile.findUnique({
    where: { userId },
  });

  const products = await prisma.product.findMany({
    where: { artisanId: userId },
    orderBy: { updatedAt: "desc" },
    include: { media: { take: 1 } },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-8">
      <VerificationBanner status={profile?.verificationStatus} />

      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Artisan dashboard</h1>
        <p className="mt-1 text-sm text-stone-600">
          Verification:{" "}
          <span className="font-medium">{profile?.verificationStatus ?? "—"}</span>
          {profile?.externalPortalId ? (
            <span className="ml-2 text-stone-500">
              (portal ref: {profile.externalPortalId})
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/artisan/products/new"
          className="inline-flex rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Add product
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-stone-900">Your products</h2>
        {products.length === 0 ? (
          <p className="text-sm text-stone-600">No products yet. Create one to get a QR code.</p>
        ) : (
          <ul className="space-y-3">
            {products.map((p) => {
              const verifyUrl = `${baseUrl.replace(/\/$/, "")}/verify/${p.id}`;
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link href={`/verify/${p.id}`} className="font-medium text-stone-900 underline">
                      {p.name}
                    </Link>
                    <p className="text-sm text-stone-600">
                      {p.category} · {p.published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/api/products/${p.id}/qr`}
                      download={`qr-${p.id}.png`}
                      className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-50"
                    >
                      Download QR
                    </a>
                    <span className="text-xs text-stone-500 self-center truncate max-w-[14rem] sm:max-w-xs">
                      {verifyUrl}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
