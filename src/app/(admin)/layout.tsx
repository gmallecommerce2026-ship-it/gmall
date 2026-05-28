// src/app/(admin)/layout.tsx
import React from 'react';
import Link from 'next/link';
import AdminSidebar from '@/layout/admin/AdminSidebar'; // Đảm bảo đường dẫn đúng
import { FiBell } from 'react-icons/fi'; // Thêm icon cho header
import AdminSearchBox from './components/AdminSearchBox';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Main Content Area - Thêm margin-left bằng width của sidebar (260px) */}
      <div className="flex-1 ml-[260px] min-w-0 flex flex-col transition-all duration-300">
        
        {/* Top Header cho Admin - Giống phong cách Header của Seller nhưng đơn giản hơn */}
        <header className="h-[70px] bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
           <h2 className="text-lg font-semibold text-gray-700">Bảng điều khiển</h2>
           
           <div className="flex items-center gap-6">
             {/* Search box — submit redirect tới /admin/orders?search=... */}
             <AdminSearchBox />

             <div className="flex items-center gap-4">
               <Link
                 href="/admin/notifications"
                 aria-label="Thông báo"
                 className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
               >
                 <FiBell size={20} />
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               </Link>
               <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
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

        {/* Page Content Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
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