import Link from "next/link";
import { isVerifiedForProductOps } from "@/lib/artisan-product-guard";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ProductForm } from "./product-form";

export default async function NewProductPage() {
  const userId = await requireUserId();
  const profile = await prisma.artisanProfile.findUnique({ where: { userId } });

  if (!isVerifiedForProductOps(profile?.verificationStatus)) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <Link href="/artisan" className="text-sm text-stone-600 hover:text-stone-900">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Registry verification required</h1>
          <p className="mt-1 text-sm text-stone-600">
            Your artisan profile must match the government handicrafts registry before you can create
            products. If you use Google sign-in, add a mobile number on{" "}
            <Link href="/artisan/profile" className="font-medium text-stone-900 underline">
              your registry profile
            </Link>
            . Otherwise register with email/password or update your details so the last 4 digits of
            your mobile match the stub dataset.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/artisan" className="text-sm text-stone-600 hover:text-stone-900">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">New product</h1>
        <p className="mt-1 text-sm text-stone-600">
          Add details and an optional image URL (HTTPS). Check &quot;Published&quot; to list it on the
          home page.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
