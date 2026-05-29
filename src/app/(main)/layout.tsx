// src/app/(main)/layout.tsx
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProChatWrapper from "@/components/chat/ProChatWrapper";
import ChatSocketProvider from "@/components/chat/ChatSocketProvider"; // wiki 0067 — luôn mounted để nhận realtime ngay cả khi popup chat đóng
import DailyActionsHandler from "@/components/points/DailyActionsHandler";
import GlobalContentFetcher from "@/components/common/GlobalContentFetcher";
import GlobalInit from "@/components/common/GlobalInit";

export default function MainLayout({ children }: { children: React.ReactNode }) {
 

  return (
    <div className="flex flex-col min-h-screen relative"> {/* Thêm relative nếu cần */}
      <GlobalInit />
      <ChatSocketProvider />
      <GlobalContentFetcher />
      <DailyActionsHandler />
      <Header />
      <main className="flex-grow">
        {children}
        <ProChatWrapper />
      </main>
      <Footer />
    </div>
  );
}