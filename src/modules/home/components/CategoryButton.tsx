// src/modules/home/components/CategoryButton.tsx
import React from 'react';
import Link from 'next/link';

// Xóa dòng import gây lỗi này:
// import { ListIcon } from '@/icons'; 

export const CategoryButton = () => {
  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-6">
      <Link href="/categories" className="inline-flex items-center gap-3 bg-brand-orange text-white px-6 py-3 rounded-t-lg font-bold text-lg hover:bg-brand-orange-dark transition-all shadow-md">
        <div className="p-1 border-2 border-white rounded">
           {/* Hamburger Icon đơn giản (SVG nội tuyến thay vì import) */}
           <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M1 7H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M1 13H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </div>
        DANH MỤC SẢN PHẨM
      </Link>
      {/* Đường kẻ cam trang trí bên dưới để kết nối với Banner */}
      <div className="w-full h-1 bg-brand-orange/50 rounded-full"></div>
    </div>
  );
};