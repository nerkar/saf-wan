"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerArtisan } from "@/app/register/actions";

const initial: { error?: string } = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerArtisan, initial);

  return (
    <>
      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="govMobile" className="block text-sm font-medium text-stone-700">
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
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
          <p className="mt-1 text-xs text-stone-500">
            Exactly 10 digits after normalization. You may prefix +91 or use a leading 0 for STD-style
            entry.
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700">
            Name <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="govState" className="block text-sm font-medium text-stone-700">
              State <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govState"
              name="govState"
              type="text"
              placeholder="e.g. JAMMU AND KASHMIR"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
          <div>
            <label htmlFor="govDistrict" className="block text-sm font-medium text-stone-700">
              District <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govDistrict"
              name="govDistrict"
              type="text"
              placeholder="e.g. UDHAMPUR"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
          <div>
            <label htmlFor="govCraft" className="block text-sm font-medium text-stone-700">
              Craft <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govCraft"
              name="govCraft"
              type="text"
              placeholder="e.g. Other Embroideries"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
          <div>
            <label htmlFor="govGender" className="block text-sm font-medium text-stone-700">
              Gender <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              id="govGender"
              name="govGender"
              type="text"
              placeholder="e.g. Female"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-stone-900 px-4 py-2 text-white hover:bg-stone-800"
        >
          Register
        </button>
      </form>

      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-stone-900 underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
