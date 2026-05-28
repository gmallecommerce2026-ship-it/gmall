// src/app/(seller)/layout.tsx
import React from 'react';
import SellerSidebar from '@/layout/seller/SellerSidebar';
import SellerRightSidebar from '@/layout/seller/SellerRightSidebar'; // [MỚI]
import ChatWindow from '@/components/chat/ChatWindow'; // [MỚI] Import ChatWindow

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* 1. Sidebar trái (Menu chính) */}
      <SellerSidebar />

      {/* 2. Content chính — mobile: sidebar overlay, content full width;
             desktop (lg≥): sidebar fixed 260px, content margin-left 260px.
             Audit Seller #27: trước đây ml-[260px] cứng → mobile overflow.  */}
      <main className="flex-1 lg:ml-[260px] min-h-screen transition-all duration-300 w-full min-w-0">
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
      <ChatWindow />
    </div>
  );
}