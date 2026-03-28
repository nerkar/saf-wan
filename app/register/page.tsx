import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Artisan registration</h1>
        <p className="mt-1 text-sm text-stone-600">
          Enter a valid <strong>10-digit</strong> Indian mobile; verification matches the{" "}
          <strong>last 4 digits</strong> of that number to the in-app registry CSV. Other fields are
          optional. Products stay disabled until there is a match.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
