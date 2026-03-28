type Props = {
  className?: string;
};

/** Route loading: pure CSS gradients suggesting a small flying carpet (no images). */
export function FlyingCarpetSpinner({ className }: Props) {
  return (
    <div
      className={["flying-carpet-spinner", className].filter(Boolean).join(" ")}
      role="status"
      aria-label="Loading"
    />
  );
}
