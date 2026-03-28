"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { registerArtisan } from "@/app/register/actions";

const initial: { error?: string } = {};

export function RegisterForm() {
  const [state, formAction] = useFormState(registerArtisan, initial);

  return (
    <>
      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700">
            Display name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
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
