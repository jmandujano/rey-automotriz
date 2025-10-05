"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Global providers wrapper. This component runs on the client and
 * encapsulates providers that require client side contexts such as
 * the NextAuth SessionProvider. Additional providers (e.g. theme
 * context, state management) can be added here.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}