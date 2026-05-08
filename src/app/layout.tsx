// src/app/layout.tsx
import React from "react";
import "@/styles/globals.css"; // Hoặc src/app/globals.css tùy cấu trúc của bạn
import AuthProvider from "@/components/auth/AuthProvider";
import { TrackingProvider } from "@/hooks/useTracking";
import { Toaster } from "react-hot-toast";
import WelcomePopup from "@/components/layout/WelcomePopup";

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
        {/* Global toaster — các page lẻ (cart, checkout, payment...) đã tự
            mount Toaster riêng để override position; nhưng các action toàn cục
            (newsletter signup ở footer, logout từ user dropdown, v.v.) cần
            Toaster ở root mới hiển thị. */}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {/* #34 — popup chào mừng lần đầu, tự ẩn sau khi user dismiss (lưu localStorage). */}
        <WelcomePopup />
      </body>
    </html>
  );
}