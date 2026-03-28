import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

/** Mobile-first: verification is often opened from a phone after scanning a QR code. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dfd2bc",
};

export const metadata: Metadata = {
  description: "Public product and artisan authenticity details.",
};

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return children;
}
