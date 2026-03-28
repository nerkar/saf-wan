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
    <div className="space-y-6">
      {registered ? (
        <p className="craft-alert craft-alert-success">
          Account created. Sign in below.
        </p>
      ) : null}
      {error ? <p className="craft-alert craft-alert-error">{error}</p> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="craft-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="craft-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="craft-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="craft-input"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="craft-btn-primary w-full min-h-[44px] disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {showGoogle ? (
        <>
          <div className="relative py-2 text-center text-xs text-stone-500">
            <span className="relative z-10 bg-[var(--craft-bg)] px-2">or</span>
            <span className="absolute left-0 right-0 top-1/2 z-0 h-px bg-[var(--craft-border)]" aria-hidden />
          </div>
          <button
            type="button"
            className="craft-btn-secondary w-full min-h-[44px] font-medium"
            onClick={() => signIn("google", { callbackUrl: "/artisan" })}
          >
            Continue with Google
          </button>
        </>
      ) : null}

      <p className="text-center text-sm text-[var(--craft-muted)]">
        No account?{" "}
        <Link href="/register" className="craft-link">
          Register
        </Link>
      </p>
    </div>
  );
}
