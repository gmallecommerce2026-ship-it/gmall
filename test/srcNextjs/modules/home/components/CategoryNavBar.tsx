'use client';
import React from 'react';
import Link from 'next/link';
import { SystemMenuDropdown } from '@/components/layout/Header/SystemMenuDropdown';
import { SYSTEM_MENU_KEYS } from '@/services/ContentService';

export default function CategoryNavBar() {
  return (
    // [FIX]: z-[60] để cao hơn Overlay (z-40) và các Panel khác
    <div className="w-full bg-white border-b border-gray-200 category-nav-bar relative z-[60]">
       <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center h-[50px] gap-6">
             <div className="hidden lg:flex items-center h-full gap-2">
               
                {/* Các menu động từ hệ thống */}
                <SystemMenuDropdown label="Người nhận" configKey={SYSTEM_MENU_KEYS.RECIPIENT} />
                <SystemMenuDropdown label="Dịp lễ & Sự kiện" configKey={SYSTEM_MENU_KEYS.OCCASION} />
                <SystemMenuDropdown label="Quà Doanh Nghiệp" configKey={SYSTEM_MENU_KEYS.BUSINESS} />

                {/* Link tĩnh */}
                <Link 
                   href="/blog" 
                   className="
                      flex items-center px-4 py-2 h-full
                      text-[13px] font-medium text-gray-700 
                      hover:text-[#E78720] transition-colors 
                      uppercase tracking-wider
                      relative z-20
                   "
                >
                   Blog Quà Tặng
                </Link>
             </div>
          </div>
       </div>
    </div>
  );
}