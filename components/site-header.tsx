import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="craft-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="relative h-24 w-24 shrink-0 cursor-default"
            aria-hidden="true"
          >
            <Image
              src="/brand-logo.png"
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 object-contain select-none"
              priority
            />
          </span>
          <Link href="/" className="craft-brand">
            Saf-Wan
          </Link>
        </div>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className="craft-nav-link">
            Home
          </Link>
          {session?.user ? (
            <>
              <Link href="/artisan" className="craft-nav-link">
                Artisan dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="craft-nav-link">
                Artisan login
              </Link>
              <Link
                href="/register"
                className="craft-btn-primary min-h-[40px] px-3.5 py-2 text-sm shadow-md"
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
