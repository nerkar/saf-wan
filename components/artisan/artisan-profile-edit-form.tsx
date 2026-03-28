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
      {state?.error ? <p className="craft-alert craft-alert-error">{state.error}</p> : null}
      {state?.success ? (
        <p className="craft-alert craft-alert-success">
          Profile saved. Verification status was updated from the registry stub.
        </p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="craft-label">
            Display name <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            defaultValue={props.defaultDisplayName}
            className="craft-input"
          />
        </div>

        <div>
          <label htmlFor="govMobile" className="craft-label">
            Mobile{" "}
            <span className="text-stone-500">
              ({mobileRequired ? "required — " : ""}
              10-digit Indian number; last 4 digits must match the registry)
            </span>
          </label>
          <input
            id="govMobile"
            name="govMobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required={mobileRequired}
            maxLength={20}
            placeholder={
              props.hasMobileOnFile
                ? "Leave blank to keep current; or new 10-digit / +91 number"
                : "9876543210 or +91 9876543210"
            }
            title="Enter a valid 10-digit Indian mobile (6–9 first digit). +91 or leading 0 allowed."
            defaultValue={props.defaultGovMobile}
            className="craft-input"
          />
          <p className="mt-1 text-xs text-stone-500">
            Exactly 10 digits. Optional +91 or leading 0. Leave blank only when you already have a
            number on file and want to keep it.
          </p>
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
              defaultValue={props.defaultGovState}
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
              defaultValue={props.defaultGovDistrict}
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
              defaultValue={props.defaultGovCraft}
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
              defaultValue={props.defaultGovGender}
              className="craft-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="craft-btn-primary min-h-[44px] px-5 text-sm disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save profile"}
          </button>
          <Link
            href="/artisan"
            className="craft-btn-secondary inline-flex min-h-[44px] items-center px-5 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
