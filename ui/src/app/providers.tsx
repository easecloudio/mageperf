'use client'

import { MockAuthProvider } from "@/contexts/MockAuthContext";
import { AppStateProvider } from "@/contexts/AppStateContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MockAuthProvider>
      <AppStateProvider>
        {children}
      </AppStateProvider>
    </MockAuthProvider>
  );
}