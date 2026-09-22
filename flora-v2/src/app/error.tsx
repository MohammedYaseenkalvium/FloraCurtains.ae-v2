"use client";

import { useEffect } from "react";

export default function RootError({
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
    <html>
      <body className="min-h-screen bg-flora-surface flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-flora-border p-10 w-full max-w-sm text-center">
          <div className="text-3xl font-bold text-[#991B1B] tracking-widest mb-2">ERROR</div>
          <p className="text-sm text-flora-muted mb-6">
            {error.message || "Something went wrong."}
          </p>
          <button
            onClick={reset}
            className="bg-flora-primary text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-flora-primary-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}