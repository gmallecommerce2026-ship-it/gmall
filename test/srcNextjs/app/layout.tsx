// src/app/layout.tsx
import React from "react";
import "@/styles/globals.css"; // Hoặc src/app/globals.css tùy cấu trúc của bạn
import AuthProvider from "@/components/auth/AuthProvider";
import { TrackingProvider } from "@/hooks/useTracking";

// 1. Import font Be Vietnam Pro
import { Be_Vietnam_Pro } from "next/font/google";

// 2. Cấu hình font
const mainFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"], // 300 (Light) cho nét mỏng tinh tế, 600 cho tiêu đề
  variable: "--font-main", // Biến CSS để dùng trong Tailwind
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body 
        className={`${mainFont.variable} font-sans font-light text-gray-700 antialiased overflow-x-hidden bg-gray-50`} 
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <TrackingProvider>
             {children}
          </TrackingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}