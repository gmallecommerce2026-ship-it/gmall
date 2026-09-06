// src/app/(seller)/layout.tsx
import React from 'react';
import SellerSidebar from '@/layout/seller/SellerSidebar';
import SellerRightSidebar from '@/layout/seller/SellerRightSidebar'; // [MỚI]
import ChatWindow from '@/components/chat/ChatWindow'; // [MỚI] Import ChatWindow
import ChatSocketProvider from '@/components/chat/ChatSocketProvider'; // wiki 0067 - luôn mounted để nhận realtime ngay cả khi popup đóng
import RoleGuard from '@/components/auth/RoleGuard';
// wiki 0110: xem giải thích trong PortalNavContext.tsx
import { PortalNavProvider, PortalNavToggle } from '@/layout/shared/PortalNavContext';
import type { Metadata } from 'next';

// Wiki 0104: xem giải thích ở `(admin)/layout.tsx` — kênh người bán cũng là khu nội bộ,
// không lập chỉ mục, và gom hậu tố tiêu đề về một kiểu.
export const metadata: Metadata = {
  title: { default: 'Kênh người bán GMall', template: '%s | Kênh người bán GMall' },
  robots: { index: false, follow: false },
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard phân quyền (wiki 0108): xem giải thích ở `(admin)/layout.tsx` — buyer thật
  // mở `/seller-dashboard` là thấy nguyên vỏ Kênh Người Bán. Chặn nằm ở client chứ
  // không ở `src/proxy.tsx` vì cookie `accessToken` thuộc host của BE, khác host FE →
  // proxy không bao giờ đọc được nó, chặn ở server sẽ đá cả seller thật ra ngoài.
  // ADMIN cũng được vào để còn hỗ trợ/kiểm tra shop. Bọc cả sidebar + ChatSocketProvider
  // để buyer không mở socket chat của kênh bán. `/seller/login` ở `app/seller/login`
  // (ngoài group `(seller)`) nên không bị chặn.
  return (
    <RoleGuard allow={['SELLER', 'ADMIN']} redirectTo="/seller/login">
    <PortalNavProvider>
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* 1. Sidebar trái (Menu chính) — drawer dưới lg, cố định từ lg (wiki 0110) */}
      <SellerSidebar />

      {/* 2. Content chính — desktop (lg≥): sidebar fixed 260px, content margin-left 260px.
             Audit Seller #27: trước đây ml-[260px] cứng → mobile overflow.
             wiki 0110: comment cũ ở đây ghi "mobile: sidebar overlay" nhưng KHÔNG có overlay
             nào được cài — khu người bán trên điện thoại hoàn toàn không có điều hướng.
             Nay có thật: thanh trên cùng dưới đây là chỗ đặt nút mở menu. */}
      <main className="flex-1 lg:ml-[260px] min-h-screen transition-all duration-300 w-full min-w-0">
        <header className="lg:hidden h-14 bg-white border-b border-gray-200 sticky top-0 z-40 px-3 flex items-center gap-2">
          <PortalNavToggle label="Mở menu kênh người bán" />
          <span className="font-semibold text-gray-700 truncate">Kênh người bán</span>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
            {children}
        </div>
      </main>

      {/* 3. Sidebar phải (Công cụ nhanh) [MỚI] */}
      <SellerRightSidebar />

      {/* 4. Cửa sổ Chat Global [MỚI] 
         ChatWindow đã có 'use client' và logic fixed position, 
         nên chỉ cần đặt ở đây là nó sẽ hiển thị đè lên trên khi mở.
      */}
      <ChatSocketProvider />
      <ChatWindow />
    </div>
    </PortalNavProvider>
    </RoleGuard>
  );
}