"use client";

import React from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus refetchInterval={30}>
      {children}
    </NextAuthSessionProvider>
  );
}
