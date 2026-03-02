// src/modules/home/components/CategoryNavBar.tsx
'use client';

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; 
import Link from "next/link";
import { 
  RECIPIENT_DATA, 
  OCCASION_DATA, 
  BUSINESS_GIFT_DATA 
} from "@/components/layout/Header/constants";

// --- Types ---
type DropdownItem = {
  title: string;
  links: string[];
};

type DropdownGroup = {
  groupName: string;
  items: DropdownItem[];
};

// --- Styles Scrollbar ---
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin-top: 4px;
    margin-bottom: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #f97316; /* Brand Orange */
  }
`;

// --- Components (Giữ nguyên) ---

const DropdownSection = ({ group }: { group: DropdownGroup }) => (
  <div className="flex flex-col h-full overflow-hidden">
    <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex-shrink-0">
      {group.groupName}
    </h4>
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
      {group.items.map((subItem, subIdx) => (
        <div key={subIdx} className="group/item">
          <Link href="#" className="flex items-center gap-1 font-bold text-gray-800 text-[14px] hover:text-brand-orange transition-colors mb-2.5">
            {subItem.title}
            <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <ul className="flex flex-col gap-2.5">
            {subItem.links.map((link, linkIdx) => (
              <li key={linkIdx}>
                <Link 
                  href="#" 
                  className="text-[13px] text-gray-500 hover:text-gray-900 hover:font-medium transition-colors duration-200 block"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="h-4 flex-shrink-0" />
    </div>
  </div>
);

const NavDropdown = ({ data }: { data: DropdownGroup[] }) => {
  return (
    <div className="bg-white shadow-2xl rounded-b-xl border-x border-b border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col h-[65vh] w-full mx-auto">
      <style>{scrollbarStyles}</style>

      {/* Body */}
      <div className="flex-1 min-h-0 p-8 pb-0">
        <div className="grid grid-cols-4 gap-8 h-full">
          {data.map((group, idx) => (
            <DropdownSection key={idx} group={group} />
          ))}

          {/* Cột Quảng cáo */}
          <div className="col-span-1 h-full pb-8">
            <div className="h-full w-full bg-gray-50 rounded-lg p-6 flex flex-col justify-between border border-gray-100 relative overflow-hidden group/card cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent" />
              <div className="relative z-10">
                  <span className="inline-block bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider shadow-sm">
                    Best Seller
                  </span>
                  <h5 className="font-serif text-2xl text-gray-800 leading-snug">
                    Hộp Quà<br/><span className="text-brand-orange">Signature</span>
                  </h5>
                  <p className="text-sm text-gray-500 mt-3 font-light leading-relaxed">
                    Thiết kế độc quyền, miễn phí khắc tên & thiệp viết tay.
                  </p>
              </div>
              <div className="relative z-10">
                <button className="w-full bg-white/80 backdrop-blur-sm hover:bg-brand-orange hover:text-white text-gray-900 text-xs font-bold py-3 px-4 rounded border border-gray-200 hover:border-brand-orange transition-all duration-300 flex items-center justify-between group/btn">
                  XEM BỘ SƯU TẬP
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
              <div className="absolute top-1/2 -right-12 w-48 h-48 bg-brand-orange/10 rounded-full blur-2xl group-hover/card:bg-brand-orange/20 transition-colors duration-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-gray-50 px-8 py-3.5 flex items-center justify-between border-t border-gray-100 z-10">
         <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
               Miễn phí vận chuyển đơn từ 500K
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               Gói quà nghệ thuật
            </div>
         </div>
         <Link href="/categories" className="text-xs font-bold text-gray-700 hover:text-brand-orange flex items-center gap-1.5 group/link transition-colors">
            Xem tất cả danh mục 
            <svg className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
         </Link>
      </div>
    </div>
  );
};

export const CategoryNavBar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navConfig = [
    { id: 'recipient', label: "NGƯỜI NHẬN", data: RECIPIENT_DATA },
    { id: 'occasion', label: "NGÀY LỄ - NHÂN DỊP", data: OCCASION_DATA },
    { id: 'business', label: "BUSINESS GIFTS", data: BUSINESS_GIFT_DATA },
    { id: 'blog', label: "BLOGS QUÀ TẶNG", data: null },
  ];

  const activeItem = navConfig.find(item => item.id === activeMenu);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <>
      {/* 1. OVERLAY (BACKDROP) */}
      {mounted && createPortal(
        <div 
          className={`
            fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[45] transition-all duration-300 ease-in-out
            ${
              activeMenu && activeItem?.data 
                ? 'opacity-100 visible' 
                : 'opacity-0 invisible pointer-events-none'
            }
          `}
        />,
        document.body
      )}

      {/* 2. NAVBAR CONTAINER */}
      <div 
        className="w-full pl-12"
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-26 lg:gap-20">
          <div className="hidden lg:flex items-center gap-12">
            {navConfig.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <div 
                  key={item.id}
                  /* FIX: Đổi z-[100] thành z-[48]. 
                    Lý do: 
                    - Phải < 50 (z-index của SearchBar container trong Header.tsx).
                    - Phải > 45 (z-index của Overlay ngay bên trên).
                    Kết quả: Overlay < Buttons < SearchBar.
                  */
                  className="relative z-[48]" 
                  onMouseEnter={() => handleMouseEnter(item.id)}
                >
                  <div className="py-5 cursor-pointer group flex items-center gap-1.5 relative">
                    <Link 
                      href="#" 
                      className={`
                        font-roboto text-[12px] font-light whitespace-nowrap uppercase tracking-wide transition-colors duration-200
                        ${isActive ? 'text-brand-orange' : 'text-gray-700 group-hover:text-brand-orange'}
                      `}
                    >
                      {item.label}
                    </Link>
                    
                    {item.data && (
                      <svg 
                        className={`w-2.5 h-2.5 transition-transform duration-300 text-gray-400 group-hover:text-brand-orange ${isActive ? 'rotate-180 text-brand-orange' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}

                    {/* Active Line */}
                    <span className={`
                      absolute bottom-0 left-0 w-full h-[3px] bg-brand-orange rounded-t-sm transition-transform duration-300 origin-bottom
                      ${isActive ? 'scale-y-100' : 'scale-y-0'}
                    `}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. MEGA MENU DROPDOWN
           FIX: Đổi z-[100] thành z-[49] để đồng bộ thấp hơn SearchBar (z-50)
        */}
        {activeItem && activeItem.data && (
          <div 
            className="absolute top-full left-0 w-full z-[49] perspective-1000"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <NavDropdown data={activeItem.data} />
          </div>
        )}
      </div>
    </>
  );
};