"use client";

import { ThemeProvider } from "next-themes";
import AuthProvider from "@/components/auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        {/* Các provider khác */}
        {children}
    </AuthProvider>
  );
}
