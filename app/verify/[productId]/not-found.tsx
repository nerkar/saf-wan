import Link from "next/link";

export default function VerifyNotFound() {
  return (
    <div className="craft-card-elevated mx-auto max-w-md space-y-4 p-8 text-center">
      <h1 className="craft-heading text-xl">Product not found</h1>
      <p className="text-sm leading-relaxed text-[var(--craft-muted)]">
        This verification link is invalid or the product is not published.
      </p>
      <Link href="/" className="craft-link inline-block text-sm">
        Back to home
      </Link>
    </div>
  );
}
