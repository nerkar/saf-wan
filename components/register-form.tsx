"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerArtisan } from "@/app/register/actions";

const initial: { error?: string } = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerArtisan, initial);

  return (
    <>
      {state?.error ? <p className="craft-alert craft-alert-error">{state.error}</p> : null}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="govMobile" className="craft-label">
            Mobile{" "}
            <span className="text-stone-500">
              (required — 10-digit Indian number; last 4 digits must match the registry)
            </span>
          </label>
          <input
            id="govMobile"
            name="govMobile"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="9876543210 or +91 9876543210"
            title="Enter a valid 10-digit Indian mobile (6–9 first digit). +91 or leading 0 allowed."
            className="craft-input"
          />
          <p className="mt-1 text-xs text-stone-500">
            Exactly 10 digits after normalization. You may prefix +91 or use a leading 0 for STD-style
            entry.
          </p>
        </div>

        <div>
          <label htmlFor="name" className="craft-label">
            Name <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="craft-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="govState" className="craft-label">
              State <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govState"
              name="govState"
              type="text"
              placeholder="e.g. JAMMU AND KASHMIR"
              className="craft-input"
            />
          </div>
          <div>
            <label htmlFor="govDistrict" className="craft-label">
              District <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govDistrict"
              name="govDistrict"
              type="text"
              placeholder="e.g. UDHAMPUR"
              className="craft-input"
            />
          </div>
          <div>
            <label htmlFor="govCraft" className="craft-label">
              Craft <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govCraft"
              name="govCraft"
              type="text"
              placeholder="e.g. Other Embroideries"
              className="craft-input"
            />
          </div>
          <div>
            <label htmlFor="govGender" className="craft-label">
              Gender <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govGender"
              name="govGender"
              type="text"
              placeholder="e.g. Female"
              className="craft-input"
            />
          </div>
        </div>

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
            minLength={8}
            autoComplete="new-password"
            className="craft-input"
          />
        </div>
        <button type="submit" className="craft-btn-primary w-full min-h-[44px]">
          Register
        </button>
      </form>

      <p className="text-center text-sm text-[var(--craft-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="craft-link">
          Sign in
        </Link>
      </p>
    </>
  );
}
