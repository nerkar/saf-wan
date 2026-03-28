"use client";

import { useFormState } from "react-dom";
import { createProduct } from "@/app/artisan/actions";

const initial: { error?: string } = {};

export function ProductForm() {
  const [state, formAction] = useFormState(createProduct, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-stone-700">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>
      <div>
        <label htmlFor="mediaUrl" className="block text-sm font-medium text-stone-700">
          Image URL (optional)
        </label>
        <input
          id="mediaUrl"
          name="mediaUrl"
          type="url"
          placeholder="https://…"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-800">
        <input type="checkbox" name="published" className="rounded border-stone-300" />
        Published (visible on home &amp; verifiable)
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-stone-900 px-4 py-2 text-white hover:bg-stone-800"
      >
        Save product
      </button>
    </form>
  );
}
