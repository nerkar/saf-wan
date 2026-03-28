"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updateArtisanProfile } from "@/app/artisan/profile/actions";

const initial: { error?: string; success?: boolean } = {};

type Props = {
  defaultDisplayName: string;
  defaultGovState: string;
  defaultGovDistrict: string;
  defaultGovCraft: string;
  defaultGovGender: string;
  defaultGovMobile: string;
  /** Google sign-in without a stored mobile — require field in UI */
  needsMobileForGoogle: boolean;
  hasMobileOnFile: boolean;
};

export function ArtisanProfileEditForm(props: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateArtisanProfile, initial);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  const mobileRequired = props.needsMobileForGoogle && !props.hasMobileOnFile;

  return (
    <>
      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Profile saved. Verification status was updated from the registry stub.
        </p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-stone-700">
            Display name <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            defaultValue={props.defaultDisplayName}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>

        <div>
          <label htmlFor="govMobile" className="block text-sm font-medium text-stone-700">
            Mobile{" "}
            <span className="text-stone-500">
              ({mobileRequired ? "required — " : ""}
              last 4 digits must match the registry)
            </span>
          </label>
          <input
            id="govMobile"
            name="govMobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required={mobileRequired}
            placeholder={
              props.hasMobileOnFile
                ? "Leave blank to keep current number; or enter a new full number"
                : "e.g. 10-digit number; verification uses the last 4 digits only"
            }
            defaultValue={props.defaultGovMobile}
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
              defaultValue={props.defaultGovState}
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
              defaultValue={props.defaultGovDistrict}
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
              defaultValue={props.defaultGovCraft}
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
              defaultValue={props.defaultGovGender}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save profile"}
          </button>
          <Link
            href="/artisan"
            className="inline-flex items-center rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
