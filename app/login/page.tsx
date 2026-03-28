import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const showGoogle =
    Boolean(process.env.AUTH_GOOGLE_ID) && Boolean(process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Artisan login</h1>
        <p className="mt-1 text-sm text-stone-600">Sign in to manage products and QR codes.</p>
      </div>

      <Suspense fallback={<p className="text-sm text-stone-500">Loading…</p>}>
        <LoginForm showGoogle={showGoogle} />
      </Suspense>
    </div>
  );
}
