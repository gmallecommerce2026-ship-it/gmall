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

      {/* 2. Content chính */}
      <main className="flex-1 ml-[260px] min-h-screen transition-all duration-300">
        <div className="p-6 md:p-8">
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