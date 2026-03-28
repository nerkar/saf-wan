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
    <div className="space-y-10">
      <VerificationBanner status={profile?.verificationStatus} />

      <section className="craft-card-elevated p-6 sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h1 className="craft-heading text-3xl">Artisan dashboard</h1>
          {user?.email ? (
            <p className="mt-2 text-sm text-[var(--craft-muted)]">
              Signed in as <span className="font-medium text-[var(--craft-ink)]">{user.email}</span>
            </p>
          ) : null}
        </div>
        <Link
          href="/artisan/profile"
          className="craft-btn-secondary mt-4 inline-flex min-h-[44px] shrink-0 items-center justify-center sm:mt-0"
        >
          Edit registry profile
        </Link>
      </section>

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
            className="craft-btn-primary inline-flex min-h-[44px] px-5 py-2.5 text-sm"
          >
            Add product
          </Link>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-[var(--craft-border)] pb-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--craft-accent)]" aria-hidden />
          <h2 className="craft-heading text-xl">Your products</h2>
        </div>
        {products.length === 0 ? (
          <div className="craft-card p-6 text-sm text-[var(--craft-muted)]">
            No products yet. Create one to get a QR code.
          </div>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => {
              const verifyUrl = getProductVerificationUrl(p.id);
              return (
                <li
                  key={p.id}
                  className="craft-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link href={`/verify/${p.id}`} className="craft-link font-semibold">
                      {p.name}
                    </Link>
                    <p className="text-sm text-[var(--craft-muted)]">
                      {p.category} · {p.published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/artisan/products/${p.id}/edit`}
                        className="craft-btn-secondary min-h-[44px] px-3 py-2 text-sm"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/api/products/${p.id}/qr`}
                        download={`qr-${p.id}.png`}
                        className="craft-btn-secondary min-h-[44px] min-w-[44px] px-3 py-2 text-sm"
                      >
                        QR (PNG)
                      </a>
                      <a
                        href={`/api/products/${p.id}/qr?format=svg`}
                        download={`qr-${p.id}.svg`}
                        className="craft-btn-secondary min-h-[44px] min-w-[44px] px-3 py-2 text-sm"
                      >
                        QR (SVG)
                      </a>
                    </div>
                    <span className="break-all text-xs text-stone-500 sm:max-w-xs sm:truncate">
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
