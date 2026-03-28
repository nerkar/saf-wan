import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const showGoogle =
    Boolean(process.env.AUTH_GOOGLE_ID) && Boolean(process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="craft-card-elevated p-6 sm:p-8">
        <h1 className="craft-heading text-2xl">Artisan login</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--craft-muted)]">
          Sign in to manage products and QR codes.
        </p>
      </div>

      <div className="craft-card p-6 sm:p-8">
        <Suspense fallback={<p className="text-sm text-[var(--craft-muted)]">Loading…</p>}>
          <LoginForm showGoogle={showGoogle} />
        </Suspense>
      </div>
    </div>
  );
}
