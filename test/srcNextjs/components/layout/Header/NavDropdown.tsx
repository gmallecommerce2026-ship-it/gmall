'use client';
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useContentStore } from '@/store/useContentStore';
import { FiChevronDown, FiArrowRight, FiChevronRight } from 'react-icons/fi';

// --- 1. TYPE DEFINITIONS MỚI (Khớp với JSON bạn vừa update) ---
interface NavItem {
  name: string;
  link: string;
}

interface NavGroup {
  label: string; // Tên nhóm con (VD: Người Thân, Tình Yêu)
  items: NavItem[];
}

interface NavColumn {
  label: string; // Tên cột lớn (VD: Cho Phụ Nữ, Cho Nam Giới)
  children: NavGroup[];
}

interface NavDropdownProps {
  label: string;
  configKey: string;
  icon?: React.ReactNode;
}

// --- 2. MOCK DATA (Cập nhật theo cấu trúc mới để fallback nếu cần) ---
// Bạn có thể giữ hoặc bỏ qua mock data này nếu tin tưởng dữ liệu từ API
const NAV_BANNERS: Record<string, { src: string; title: string; subtitle: string }> = {
  'HEADER_RECIPIENT': {
    src: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=400",
    title: "Gửi Trao Yêu Thương",
    subtitle: "Món quà thay ngàn lời nói"
  },
  'HEADER_OCCASION': {
    src: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=400",
    title: "Mùa Lễ Hội",
    subtitle: "Ưu đãi lên đến 50%"
  },
  'HEADER_BUSINESS': {
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400",
    title: "Giải Pháp Quà Tặng",
    subtitle: "Nâng tầm thương hiệu"
  }
};

export default function NavDropdown({ label, configKey, icon }: NavDropdownProps) {
  const { menus, activeDropdown, setActiveDropdown } = useContentStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const [dropdownTop, setDropdownTop] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOpen = activeDropdown === configKey;

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- EVENT HANDLERS ---
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (buttonRef.current) {
      const navContainer = buttonRef.current.closest('header') || buttonRef.current.closest('.category-nav-bar');
      if (navContainer) {
        setDropdownTop(navContainer.getBoundingClientRect().bottom);
      }
    }
    setActiveDropdown(configKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      const currentActive = useContentStore.getState().activeDropdown;
      if (currentActive === configKey) {
        setActiveDropdown(null);
      }
    }, 150);
  };

  const handlePanelMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // --- LẤY DỮ LIỆU ---
  // Ép kiểu dữ liệu lấy từ store về cấu trúc mới NavColumn[]
  const rawData = menus[configKey];
  const data = (Array.isArray(rawData) ? rawData : []) as NavColumn[];
  
  // Lấy banner
  // @ts-ignore
  const banner = NAV_BANNERS[configKey];

  if (!data || data.length === 0) return null;

  return (
    <>
      {/* --- TRIGGER BUTTON --- */}
      <button 
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative flex items-center gap-1.5 px-4 py-2 h-full 
          text-[13px] font-medium transition-colors duration-200 outline-none uppercase tracking-wider 
          rounded-t-lg border-x border-t box-border
          ${isOpen 
            ? 'bg-white text-[#E78720] border-gray-100 shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.1)] z-50' 
            : 'text-gray-700 hover:text-[#E78720] border-transparent z-auto'
          }
        `}
      >
        {icon && <span className="text-lg">{icon}</span>}
        <span>{label}</span>
        <FiChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-200 text-gray-400 ${isOpen ? '-rotate-180 text-[#E78720]' : ''}`} 
        />
        
        {isOpen && (
            <div 
                className="absolute top-full left-0 w-full h-4 bg-transparent z-50"
                style={{ height: dropdownTop - (buttonRef.current?.getBoundingClientRect().bottom || 0) + 10 }}
            />
        )}
      </button>

      {/* --- PORTAL CONTENT --- */}
      {mounted && isOpen && createPortal(
        <div 
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ top: `${dropdownTop}px`, zIndex: 45 }} 
            className="fixed left-0 w-full pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="container mx-auto px-4 relative">
                <div className="w-full max-w-[1200px] mx-auto bg-white shadow-2xl rounded-b-xl border-t border-gray-100 overflow-hidden flex max-h-[70vh]">
                    
                    {/* --- COLUMNS RENDER (LOGIC MỚI) --- */}
                    <div className="flex-1 grid grid-cols-3 divide-x divide-gray-50 bg-white">
                        {[0, 1, 2].map((colIndex) => {
                            const column = data[colIndex]; // Lấy cột tương ứng (VD: Cho Phụ Nữ)
                            
                            return (
                            <div 
                                key={colIndex} 
                                className="
                                    nav-dropdown-scrollable
                                    relative flex flex-col p-8 
                                    overflow-y-auto 
                                    overscroll-y-contain 
                                    scrollbar-thin hover:scrollbar-thumb-gray-200 scrollbar-track-transparent
                                "
                                style={{ overscrollBehaviorY: 'contain' }}
                            >
                            {column ? (
                                <div className="flex flex-col gap-6">
                                    {/* TÊN CỘT LỚN (VD: CHO PHỤ NỮ) */}
                                    <div className="pb-2 border-b border-gray-50">
                                        <h4 className="font-extrabold text-gray-900 uppercase text-[12px] tracking-[0.15em] flex items-center gap-2">
                                            <span className="w-1 h-4 rounded-sm bg-[#E78720]"></span>
                                            {column.label}
                                        </h4>
                                    </div>

                                    {/* LIST CÁC NHÓM CON (VD: NGƯỜI THÂN, TÌNH YÊU) */}
                                    <div className="flex flex-col gap-6">
                                        {column.children?.map((group, grpIdx) => (
                                            <div key={grpIdx}>
                                                {/* Tên nhóm con */}
                                                <h5 className="font-bold text-[14px] text-gray-800 mb-2">
                                                    {group.label}
                                                </h5>

                                                {/* List Item */}
                                                <ul className="flex flex-col gap-1">
                                                    {group.items?.map((item, itemIdx) => (
                                                        <li key={itemIdx}>
                                                            <Link 
                                                                href={item.link} // Link đã có sẵn từ JSON Admin, không cần generateTag nữa
                                                                className="text-[13px] text-gray-500 hover:text-[#E78720] hover:translate-x-1 transition-all duration-200 block py-0.5 flex items-center gap-1 group/link"
                                                            >
                                                                {item.name}
                                                                <FiArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 text-[#E78720]" />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : <div className="h-full"></div>}
                            </div>
                        );
                        })}
                    </div>

                    {/* --- BANNER (GIỮ NGUYÊN) --- */}
                    <div className="w-[280px] shrink-0 bg-gray-50 relative overflow-hidden group/banner border-l border-gray-100 hidden lg:block">
                        {banner && (
                        <>
                            <div className="absolute inset-0 z-0">
                                <img 
                                    src={banner.src} 
                                    alt={banner.title} 
                                    className="w-full h-full object-cover transition-transform duration-[3s] ease-in-out group-hover/banner:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            </div>
                            
                            <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                                <div className="opacity-90 transform translate-y-2 group-hover/banner:translate-y-0 group-hover/banner:opacity-100 transition-all duration-500">
                                    <p className="text-[#E78720] font-bold text-[10px] tracking-[0.2em] uppercase mb-2">
                                        {banner.subtitle}
                                    </p>
                                    <h3 className="text-xl font-serif font-bold leading-tight mb-4 text-white">
                                        {banner.title}
                                    </h3>
                                    <Link 
                                        href="/shop" 
                                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-[#E78720] transition-colors border-b border-transparent hover:border-[#E78720] pb-0.5"
                                    >
                                        Xem ngay <FiChevronRight />
                                    </Link>
                                </div>
                            </div>
                        </>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
      )}
    </>
  );
}