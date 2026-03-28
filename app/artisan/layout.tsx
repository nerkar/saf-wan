import { requireUserId } from "@/lib/session";

/**
 * All routes under `/artisan` require a signed-in user.
 * @see docs/INTEGRATION_AUTH.md
 */
export default async function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserId();

  return <div className="space-y-6">{children}</div>;
}
