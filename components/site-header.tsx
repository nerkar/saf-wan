import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-stone-900">
          Handicraft verify
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-stone-600 hover:text-stone-900">
            Home
          </Link>
          {session?.user ? (
            <>
              <Link href="/artisan" className="text-stone-600 hover:text-stone-900">
                Artisan dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 hover:text-stone-900">
                Artisan login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-stone-900 px-3 py-1.5 text-white hover:bg-stone-800"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
