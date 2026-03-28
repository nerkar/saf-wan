import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Artisan registration</h1>
        <p className="mt-1 text-sm text-stone-600">
          Create an account. Verification uses the government stub until the real API is wired.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
