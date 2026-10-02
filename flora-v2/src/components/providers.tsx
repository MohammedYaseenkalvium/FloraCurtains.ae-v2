"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // refetchOnWindowFocus + polling cause a /api/auth/session storm on
    // every focus/blur across tabs (seen dozens of calls per navigation).
    // CRM pages are server-rendered with auth() anyway; session is read
    // sparingly client-side (signOut only), so disable background refetch.
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}