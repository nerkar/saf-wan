import Link from "next/link";

type Props = {
  searchParams: Promise<{ error?: string; code?: string }>;
};

const messages: Record<string, string> = {
  Configuration:
    "Auth configuration is invalid or a network call to Google failed. Check AUTH_SECRET, AUTH_URL, and that your machine can reach Google OAuth endpoints.",
  AccessDenied: "Sign-in was cancelled or you do not have access.",
  Verification: "The sign-in link is invalid or has expired.",
  Default: "Something went wrong during sign-in. Try again or use email and password.",
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const key = params.error ?? "Default";
  const description = messages[key] ?? messages.Default;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="craft-card-elevated p-8 text-center">
        <h1 className="craft-heading text-xl">Sign-in error</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--craft-muted)]">{description}</p>
        {params.error ? (
          <p className="mt-4 font-mono text-xs text-stone-400">
            Code: {params.error}
            {params.code ? ` (${params.code})` : ""}
          </p>
        ) : null}
        <p className="mt-6 text-sm">
          <Link href="/login" className="craft-link">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
