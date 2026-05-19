"use client";

import { useEffect } from "react";

export default function AuthError({
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
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8C9BC] p-10 w-full max-w-sm text-center">
        <div className="text-3xl font-bold text-[#991B1B] tracking-widest mb-2">ERROR</div>
        <p className="text-sm text-[#6B625A] mb-6">
          {error.message || "Authentication failed. Please try again."}
        </p>
        <button
          onClick={reset}
          className="bg-[#5A0E12] text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-[#7A1E22] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}