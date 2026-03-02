// src/app/(main)/layout.tsx
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProChatWrapper from "@/components/chat/ProChatWrapper";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative"> {/* Thêm relative nếu cần */}
      <Header />
      <main className="flex-grow">
        {children}
        <ProChatWrapper />
      </main>
      <Footer />
    </div>
  );
}