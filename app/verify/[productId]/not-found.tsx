import Link from "next/link";

export default function VerifyNotFound() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-semibold text-stone-900">Product not found</h1>
      <p className="text-sm text-stone-600">
        This verification link is invalid or the product is not published.
      </p>
      <Link href="/" className="text-sm font-medium text-stone-900 underline">
        Back to home
      </Link>
    </div>
  );
}
