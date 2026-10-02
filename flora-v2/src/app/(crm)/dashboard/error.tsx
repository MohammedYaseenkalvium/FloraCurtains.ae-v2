"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Dashboard segment fallback for total failure. Replaces the dashboard when
 * every region fails, so nine simultaneous error cards never render.
 * Renders generic copy only — the raw error goes to console.error, never
 * into UI text. Retry re-renders the pre-existing dashboard reads once per
 * click via reset().
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        role="alert"
        className="w-full max-w-md rounded-flora-md border border-flora-border bg-white p-10 text-center shadow-flora-sm"
      >
        <p className="font-semibold text-flora-danger">Something went wrong loading the dashboard.</p>
        <div className="mt-5">
          <Button variant="secondary" size="md" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
