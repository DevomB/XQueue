export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="border-b border-amber-900/50 bg-amber-950/80 px-4 py-2 text-center text-sm text-amber-200">
      Demo instance — do not connect a production X account or enter sensitive data.
    </div>
  );
}
