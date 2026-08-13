// src/app/layout.tsx
import React from "react";
import type { Metadata, Viewport } from "next";
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

// Wiki 0104: root layout TRƯỚC ĐÂY không khai `metadata`. App Router kế thừa
// metadata từ layout xuống page, nên trang nào không tự khai sẽ ra HTML **không có
// thẻ `<title>`** (không phải rỗng — không tồn tại). Đo trên prod: `/`, `/login`,
// `/register` đều 0 thẻ title/description/og ⇒ Google hiện URL trần thay cho tên,
// share lên Zalo/Facebook không ra thẻ xem trước.
//   - `metadataBase` bắt buộc để `og:image` đường dẫn tương đối resolve thành URL
//     tuyệt đối; thiếu nó thì ảnh preview không hiện.
//   - `title.template` ép nhất quán thương hiệu ở MỌI trang con mà không phải sửa
//     từng file — đây là thuốc chữa gốc cho tình trạng lẫn lộn "G-Mall" / "GMall".
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gmall.vn";
const SITE_NAME = "GMall";
const SITE_DESC =
  "GMall — nền tảng quà tặng và mua sắm trực tuyến. Hàng chính hãng, gói quà tận tâm, " +
  "giao nhanh toàn quốc và 1% mỗi đơn hàng dành cho quỹ từ thiện.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GMall — Nền tảng quà tặng & mua sắm trực tuyến",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "GMall", "quà tặng", "mua sắm online", "quà tặng online",
    "gói quà", "mẹ và bé", "hàng chính hãng", "sàn thương mại điện tử",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "GMall — Nền tảng quà tặng & mua sắm trực tuyến",
    description: SITE_DESC,
    images: [{ url: "/images/gmall-logo.png", width: 677, height: 369, alt: "GMall" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GMall — Nền tảng quà tặng & mua sắm trực tuyến",
    description: SITE_DESC,
    images: ["/images/gmall-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/gmall-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Chặn iOS tự biến dãy số (mã đơn, giá) thành link gọi điện màu xanh
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

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