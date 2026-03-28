import { FlyingCarpetSpinner } from "@/components/flying-carpet-spinner";

export default function RouteLoading() {
  return (
    <div
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 py-20"
      aria-busy="true"
      aria-live="polite"
    >
      <FlyingCarpetSpinner />
      <span className="sr-only">Loading</span>
    </div>
  );
}
