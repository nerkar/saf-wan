import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

const craftDisplay = Fraunces({
  variable: "--font-craft-display",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saf-Wan",
  description: "Verify authentic handicraft products and artisan records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`craft-body ${craftDisplay.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SiteHeader />
          <main className="craft-main mx-auto max-w-5xl px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
