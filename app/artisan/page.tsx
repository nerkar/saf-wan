import Link from "next/link";
import { ArtistProfileDetails } from "@/components/artisan/artist-profile-details";
import { VerificationBanner } from "@/components/artisan/verification-banner";
import { isVerifiedForProductOps } from "@/lib/artisan-product-guard";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getProductVerificationUrl } from "@/lib/verification-url";

export default async function ArtisanDashboardPage() {
  const userId = await requireUserId();

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
    prisma.artisanProfile.findUnique({ where: { userId } }),
  ]);

  const products = await prisma.product.findMany({
    where: { artisanId: userId },
    orderBy: { updatedAt: "desc" },
    include: { media: { take: 1 } },
  });

  return (
    <div className="space-y-8">
      <VerificationBanner status={profile?.verificationStatus} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Artisan dashboard</h1>
          {user?.email ? (
            <p className="mt-1 text-sm text-stone-600">
              Signed in as <span className="font-medium text-stone-800">{user.email}</span>
            </p>
          ) : null}
        </div>
        <Link
          href="/artisan/profile"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Edit registry profile
        </Link>
      </div>

      {profile ? (
        <ArtistProfileDetails
          verificationStatus={profile.verificationStatus}
          displayName={profile.displayName}
          accountEmail={user?.email ?? null}
          accountName={user?.name ?? null}
          govState={profile.govState}
          govDistrict={profile.govDistrict}
          govCraft={profile.govCraft}
          govGender={profile.govGender}
          govMobile={profile.govMobile}
          externalPortalId={profile.externalPortalId}
        />
      ) : null}

      {isVerifiedForProductOps(profile?.verificationStatus) ? (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/artisan/products/new"
            className="inline-flex rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Add product
          </Link>
        </div>
      ) : null}

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
                      <a
                        href={`/api/products/${p.id}/qr`}
                        download={`qr-${p.id}.png`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
                      >
                        QR (PNG)
                      </a>
                      <a
                        href={`/api/products/${p.id}/qr?format=svg`}
                        download={`qr-${p.id}.svg`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 hover:bg-stone-50"
                      >
                        QR (SVG)
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
