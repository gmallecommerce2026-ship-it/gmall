// src/app/seller/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function SellerAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-slate-800">
      {/* Header tối giản */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold text-orange-600 tracking-tight">
              GMall
            </Link>
            <span className="text-xl text-gray-300">|</span>
            <span className="text-lg font-medium text-gray-700">Kênh Người Bán</span>
          </div>
          <div className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
            <Link href="/help">Bạn cần trợ giúp?</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-[1000px] flex gap-12 items-center justify-center">
            {/* Có thể thêm ảnh minh họa bên trái ở đây nếu muốn */}
            {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm bg-white border-t border-gray-100">
        <div className="mb-2 space-x-4">
            <Link href="#" className="hover:text-gray-600">Điều khoản</Link>
            <Link href="#" className="hover:text-gray-600">Chính sách bảo mật</Link>
        </div>
        <p>© 2025 GMall Seller Centre. All rights reserved.</p>
      </footer>
    </div>
  );
}