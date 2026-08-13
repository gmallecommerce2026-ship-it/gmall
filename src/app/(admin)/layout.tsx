// src/app/(admin)/layout.tsx
import React from 'react';
import Link from 'next/link';
import AdminSidebar from '@/layout/admin/AdminSidebar'; // Đảm bảo đường dẫn đúng
import { FiBell } from 'react-icons/fi'; // Thêm icon cho header
import AdminSearchBox from './components/AdminSearchBox';
import type { Metadata } from 'next';

// Wiki 0104: các trang admin tự viết hậu tố "| Admin Portal" / "| Admin" / "| Admin
// Dashboard" — ba kiểu cho cùng một khu vực. Đặt template ở layout nhóm route để mọi
// trang con nhất quán mà không phải sửa từng file, và `noindex` để khu quản trị không
// bao giờ lọt vào kết quả tìm kiếm (trước đây thừa hưởng `index: true` từ root).
export const metadata: Metadata = {
  title: { default: 'Quản trị GMall', template: '%s | Quản trị GMall' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Main Content Area — mobile full-width; desktop (lg≥) margin 260px cho sidebar.
            Audit Admin #1 wiki 0066: trước ml-[260px] cứng → mobile content tràn / che bởi sidebar. */}
      <div className="flex-1 lg:ml-[260px] min-w-0 flex flex-col transition-all duration-300 w-full">

        <header className="h-[70px] bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-6 lg:px-8 flex items-center justify-between shadow-sm">
           <h2 className="text-base md:text-lg font-semibold text-gray-700 truncate">Bảng điều khiển</h2>

           <div className="flex items-center gap-3 md:gap-6">
             <AdminSearchBox />

             <div className="flex items-center gap-2 md:gap-4">
               <Link
                 href="/admin/notifications"
                 aria-label="Thông báo"
                 className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
               >
                 <FiBell size={20} />
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               </Link>
               <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                    AD
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700 leading-none">Admin User</p>
                    <p className="text-[10px] text-gray-400">Super Admin</p>
                  </div>
               </div>
             </div>
           </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
            {children}
          </div>
        </main>
        
        {/* Footer Admin */}
        <footer className="py-4 text-center text-gray-400 text-xs bg-white border-t border-gray-100">
          © 2025 GMall Admin Control Panel. Version 1.2.0
        </footer>
      </div>
    </div>
  );
}