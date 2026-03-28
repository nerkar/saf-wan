import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtisanProfileEditForm } from "@/components/artisan/artisan-profile-edit-form";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function ArtisanProfilePage() {
  const userId = await requireUserId();

  const [user, profile, googleAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
    prisma.artisanProfile.findUnique({ where: { userId } }),
    prisma.account.findFirst({ where: { userId, provider: "google" }, select: { id: true } }),
  ]);

  if (!profile) {
    redirect("/artisan");
  }

  const needsMobileForGoogle = Boolean(googleAccount) && !profile.govMobile;
  const hasMobileOnFile = Boolean(profile.govMobile);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/artisan" className="text-sm text-stone-600 hover:text-stone-900">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Registry profile</h1>
        <p className="mt-1 text-sm text-stone-600">
          {needsMobileForGoogle
            ? "You signed in with Google. Add your mobile number so we can match the handicrafts registry (last 4 digits). Optional fields below are stored on your profile."
            : "Update the details used for registry verification. Leave mobile blank to keep your current number."}
        </p>
      </div>

      <ArtisanProfileEditForm
        defaultDisplayName={profile.displayName ?? user?.name ?? ""}
        defaultGovState={profile.govState ?? ""}
        defaultGovDistrict={profile.govDistrict ?? ""}
        defaultGovCraft={profile.govCraft ?? ""}
        defaultGovGender={profile.govGender ?? ""}
        defaultGovMobile={profile.govMobile ?? ""}
        needsMobileForGoogle={needsMobileForGoogle}
        hasMobileOnFile={hasMobileOnFile}
      />
    </div>
  );
}
