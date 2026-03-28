import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="craft-card-elevated p-6 sm:p-8">
        <h1 className="craft-heading text-2xl">Artisan registration</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--craft-muted)]">
          Enter a valid <strong>10-digit</strong> Indian mobile; verification matches the{" "}
          <strong>last 4 digits</strong> of that number to the in-app registry CSV. Other fields are
          optional. Products stay disabled until there is a match.
        </p>
      </div>

      <div className="craft-card p-6 sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
