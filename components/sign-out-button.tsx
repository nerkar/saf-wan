"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button type="button" className="craft-btn-ghost text-stone-600" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
