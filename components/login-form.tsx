"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

type Props = {
  showGoogle: boolean;
};

export function LoginForm({ showGoogle }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    if (res?.ok) {
      router.push("/artisan");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {registered ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Account created. Sign in below.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-stone-900 px-4 py-2 text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {showGoogle ? (
        <>
          <div className="relative py-2 text-center text-xs text-stone-500">
            <span className="bg-[var(--background)] relative z-10 px-2">or</span>
            <span className="absolute left-0 right-0 top-1/2 z-0 h-px bg-stone-200" aria-hidden />
          </div>
          <button
            type="button"
            className="w-full rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-900 hover:bg-stone-50"
            onClick={() => signIn("google", { callbackUrl: "/artisan" })}
          >
            Continue with Google
          </button>
        </>
      ) : null}

      <p className="text-center text-sm text-stone-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-stone-900 underline">
          Register
        </Link>
      </p>
    </div>
  );
}
