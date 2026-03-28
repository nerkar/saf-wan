import Link from "next/link";
import { QrPngPreviewButton } from "@/components/artisan/qr-png-preview-button";
import { VerificationBanner } from "@/components/artisan/verification-banner";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getProductVerificationUrl } from "@/lib/verification-url";

export default async function ArtisanDashboardPage() {
  const userId = await requireUserId();

  const profile = await prisma.artisanProfile.findUnique({
    where: { userId },
  });

  const products = await prisma.product.findMany({
    where: { artisanId: userId, archived: false },
    orderBy: { updatedAt: "desc" },
    include: { media: { take: 1 } },
  });

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
              const verifyUrl = getProductVerificationUrl(p.id);
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/artisan/products/${p.id}/edit`}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
                      >
                        Edit
                      </Link>
                      <QrPngPreviewButton
                        productId={p.id}
                        productName={p.name}
                        verifyUrl={verifyUrl}
                      />
                      <a
                        href={`/api/products/${p.id}/qr?format=svg`}
                        download={`qr-${p.id}.svg`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
                      >
                        QR (Download)
                      </a>
                    </div>
                    <span className="text-xs text-stone-500 break-all sm:max-w-xs sm:truncate">
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
