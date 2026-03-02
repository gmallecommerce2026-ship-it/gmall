// src/components/layout/Header/MegaMenu.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- ICONS (GIỮ NGUYÊN) ---
const Icons = {
  Menu: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
};

// --- MOCK DATA (GIỮ NGUYÊN) ---
const createSubItems = (prefix: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-sub-${i}`,
    name: `${prefix} Loại ${i + 1}`,
    slug: `${prefix}-loai-${i + 1}`,
    children: Array.from({ length: 8 }).map((_, j) => ({
      id: `${prefix}-item-${i}-${j}`,
      name: `${prefix} Sản phẩm ${j + 1}`,
      slug: `${prefix}-san-pham-${j + 1}`,
    })),
  }));
};

const FULL_CATEGORIES = [
  { id: 'dt', name: 'Điện thoại & Phụ kiện', slug: 'dien-thoai', children: createSubItems('Điện thoại', 12) },
  { id: 'mt', name: 'Máy tính & Laptop', slug: 'may-tinh', children: createSubItems('Laptop', 10) },
  { id: 'tt-nam', name: 'Thời Trang Nam', slug: 'thoi-trang-nam', children: createSubItems('Nam', 15) },
  { id: 'tt-nu', name: 'Thời Trang Nữ', slug: 'thoi-trang-nu', children: createSubItems('Nữ', 15) },
  { id: 'me-be', name: 'Mẹ & Bé', slug: 'me-be', children: createSubItems('Mẹ Bé', 12) },
  { id: 'nha-cua', name: 'Nhà Cửa & Đời Sống', slug: 'nha-cua', children: createSubItems('Nhà cửa', 10) },
  { id: 'my-pham', name: 'Sắc Đẹp & Mỹ Phẩm', slug: 'sac-dep', children: createSubItems('Mỹ phẩm', 12) },
  { id: 'sk', name: 'Sức Khỏe', slug: 'suc-khoe', children: createSubItems('Thuốc', 8) },
  { id: 'giay-dep', name: 'Giày Dép Nam/Nữ', slug: 'giay-dep', children: createSubItems('Giày', 10) },
  { id: 'tui-vi', name: 'Túi Ví Thời Trang', slug: 'tui-vi', children: createSubItems('Túi', 10) },
  { id: 'dong-ho', name: 'Đồng Hồ & Trang Sức', slug: 'dong-ho', children: createSubItems('Đồng hồ', 8) },
  { id: 'the-thao', name: 'Thể Thao & Du Lịch', slug: 'the-thao', children: createSubItems('Sport', 10) },
  { id: 'oto', name: 'Ô Tô & Xe Máy', slug: 'oto-xe-may', children: createSubItems('Xe', 8) },
  { id: 'sach', name: 'Nhà Sách Online', slug: 'nha-sach', children: createSubItems('Sách', 12) },
  { id: 'voucher', name: 'Voucher & Dịch Vụ', slug: 'voucher', children: createSubItems('Voucher', 4) },
];

// Thêm Interface Props
interface MegaMenuProps {
  isSticky?: boolean;
  headerHeight?: number;
}

const MegaMenu = ({ isSticky = false, headerHeight = 0 }: MegaMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !activeCategoryId && FULL_CATEGORIES.length > 0) {
      setActiveCategoryId(FULL_CATEGORIES[0].id);
    }
  }, [isOpen, activeCategoryId]);

  // --- LOGIC XỬ LÝ KHÓA SCROLL & BÙ PADDING (FIX GIẬT) ---
  useEffect(() => {
    if (isOpen) {
      // 1. Tính độ rộng scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // 2. Khóa scroll
      document.body.style.overflow = 'hidden';

      // 3. Bù padding cho Body và Header (nếu header đang fixed)
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        // Tìm header đang fixed (dựa vào class trong Header.tsx)
        const fixedHeader = document.querySelector('header.fixed') as HTMLElement;
        if (fixedHeader) {
           fixedHeader.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
    } else {
      // RESET
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      const fixedHeader = document.querySelector('header.fixed') as HTMLElement;
      if (fixedHeader) {
         fixedHeader.style.paddingRight = '';
      }
    }

    // Cleanup khi unmount
    return () => { 
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      const fixedHeader = document.querySelector('header.fixed') as HTMLElement;
      if (fixedHeader) {
         fixedHeader.style.paddingRight = '';
      }
    };
  }, [isOpen]);

  const activeCategory = FULL_CATEGORIES.find(c => c.id === activeCategoryId);
  
  // --- LOGIC CHIỀU CAO (GIỮ NGUYÊN) ---
  let menuHeight = 'calc(100vh - 180px)'; 
  if (isSticky && headerHeight > 0) {
     menuHeight = `calc(100vh - ${headerHeight - 8}px)`;
  }

  return (
    <div 
      className="relative z-40"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* --- TRIGGER BUTTON (GIỮ NGUYÊN UI) --- */}
      <div 
        className={`
          w-[220px] h-[42px] mt-1 rounded-full px-5 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-sm
          ${isOpen ? 'bg-brand-orange text-white' : 'bg-brand-orange text-white hover:bg-brand-orange-600'}
        `}
      >
        <div className="flex items-center gap-3">
            <Icons.Menu className="w-5 h-5" />
            <span className="font-lighter text-[14px]">Danh mục</span>
        </div>
        <Icons.ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* --- DROPDOWN PANEL (GIỮ NGUYÊN UI) --- */}
      {isOpen && (
        <div className="absolute top-full left-0 pt-2 w-full md:w-[1000px] lg:w-[1340px] -left-0">
           {/* Container chính: Màu nền đồng bộ website (bg-gray-50) */}
           <div 
             className="w-full bg-gray-50 flex overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
             style={{ height: menuHeight }} 
           >
              {/* Sidebar Menu (Cấp 1) */}
              <div className="w-[240px] flex-shrink-0 bg-gray-50 flex flex-col overflow-y-auto border-r border-gray-200 scrollbar-thin scrollbar-thumb-gray-200">
                {FULL_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    className={`
                      flex items-center justify-between px-4 py-3 cursor-pointer text-[13px] font-medium transition-all
                      ${activeCategoryId === category.id 
                        ? 'bg-gray-50 text-brand-orange font-bold' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-50 hover:text-brand-orange'
                      }
                    `}
                  >
                    <span className="line-clamp-1">{category.name}</span>
                    {activeCategoryId === category.id && <Icons.ChevronRight />}
                  </div>
                ))}
                <div className="h-10 shrink-0" />
              </div>

              {/* Main Content (Cấp 2 & 3) */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
                {activeCategory ? (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-200">
                        {activeCategory.name} 
                        <span className="text-sm font-normal text-gray-400">Xem tất cả</span>
                    </h3>
                    <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8 pb-20">
                        {activeCategory.children?.map((subCatL2) => (
                        <div key={subCatL2.id} className="flex flex-col gap-2">
                            <Link 
                            href={`/category/${subCatL2.slug}`}
                            className="font-bold text-gray-800 text-[14px] hover:text-brand-orange transition-colors"
                            >
                            {subCatL2.name}
                            </Link>
                            <div className="flex flex-col gap-1.5 mt-1">
                            {subCatL2.children?.map((subCatL3) => (
                                <Link
                                key={subCatL3.id}
                                href={`/category/${subCatL2.slug}/${subCatL3.slug}`}
                                className="text-[13px] text-gray-500 hover:text-brand-orange transition-colors hover:translate-x-1 duration-200 block"
                                >
                                {subCatL3.name}
                                </Link>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <span>Đang tải...</span>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;