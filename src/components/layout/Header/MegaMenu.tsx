'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CategoryService, CategoryTreeItem } from '@/services/category.service';
import { ChevronDown, Menu as MenuIcon, ChevronRight } from 'lucide-react';
import { getSearchUrl } from '@/lib/url-helper';

interface MegaMenuProps {
  isSticky?: boolean;
  headerHeight?: number;
  onMenuOpenChange?: (isOpen: boolean, scrollBarWidth: number) => void;
}

const MegaMenu = ({ isSticky = false, headerHeight = 0, onMenuOpenChange }: MegaMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu cây danh mục
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const tree = await CategoryService.getTree();
        if (Array.isArray(tree) && tree.length > 0) {
          setCategories(tree);
          setActiveRootId(tree[0].id);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to load category tree', error);
        setCategories([]);
      } font-medium {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  // Khóa scroll body khi mở menu
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (onMenuOpenChange) onMenuOpenChange(true, scrollbarWidth);
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (onMenuOpenChange) onMenuOpenChange(false, 0);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (onMenuOpenChange) onMenuOpenChange(false, 0);
    };
  }, [isOpen, onMenuOpenChange]);

  const activeCategory = categories.find((c) => c.id === activeRootId);

  let menuHeight = 'calc(100vh - 180px)';
  if (isSticky && headerHeight > 0) {
    menuHeight = `calc(100vh - ${headerHeight}px)`;
  }

  const getSafeLink = (cat: CategoryTreeItem) => {
    return getSearchUrl({
      category: cat.slug,
      tag: (cat as any).tag,
    });
  };

  return (
    <div
      className="relative z-40 group/menu w-full"
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Nút Trigger Mở Menu */}
      <div
        onMouseEnter={() => setIsOpen(true)}
        className={`
          w-full h-[42px] mt-1 rounded-full px-5 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-sm
          ${isOpen ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}
        `}
      >
        <div className="flex items-center gap-3">
          <MenuIcon size={20} />
          <span className="font-bold text-[14px] uppercase tracking-wider">Danh mục</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* NỘI DUNG MEGA MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 pt-2 w-full md:w-[1000px] lg:w-[1340px] z-50">
          <div
            className="w-full bg-white flex overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 rounded-b-md border border-gray-100 shadow-xl"
            style={{ height: menuHeight }}
          >
            {/* 1. SIDEBAR DANH MỤC CẤP 1 */}
            <div className="w-[240px] flex-shrink-0 bg-gray-50 flex flex-col overflow-y-auto custom-scrollbar border-r border-gray-200 pb-20">
              {loading ? (
                <div className="p-8 text-xs text-center text-gray-400">Đang tải...</div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveRootId(cat.id)}
                    className={`
                      flex items-center justify-between px-4 py-3 cursor-pointer text-[14px] font-medium transition-all border-b border-gray-100
                      ${
                        activeRootId === cat.id
                          ? 'bg-white text-orange-600 font-bold border-l-4 border-l-orange-500 shadow-sm'
                          : 'text-gray-700 hover:bg-white hover:text-orange-600 border-l-4 border-l-transparent'
                      }
                    `}
                  >
                    <Link href={getSafeLink(cat)} className="flex-1 line-clamp-1">
                      {cat.name}
                    </Link>
                    {activeRootId === cat.id && <ChevronRight size={14} />}
                  </div>
                ))
              )}
            </div>

            {/* 2. MAIN CONTENT (CẤP 2 & CẤP 3) */}
            <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar pb-24">
              {activeCategory ? (
                <div>
                  {/* Header danh mục đang chọn */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <h3 className="text-[16px] uppercase font-bold text-gray-800 flex items-center gap-2 tracking-wide">
                      {activeCategory.name}
                    </h3>
                    <Link
                      href={getSafeLink(activeCategory)}
                      className="text-[13px] font-medium text-orange-500 hover:underline flex items-center gap-1"
                    >
                      Xem tất cả <ChevronRight size={14} />
                    </Link>
                  </div>

                  {/* 
                    BỐ CỤC MULTI-COLUMN TỐI ƯU KHỎANG TRẮNG:
                    - columns-3 xl:columns-4: Tự động chia nhóm sang các cột
                    - space-y-6: Khoảng cách dọc giữa các nhóm trong cùng một cột
                    - break-inside-avoid: Giữ nguyên vẹn nhóm danh mục không bị đứt đoạn giữa các cột
                  */}
                  <div className="columns-3 xl:columns-4 gap-x-10 space-y-6">
                    {activeCategory.children?.map((lvl2) => (
                      <div
                        key={lvl2.id}
                        className="break-inside-avoid flex flex-col gap-2 bg-gray-50/50 hover:bg-orange-50/20 p-3 rounded-xl border border-gray-100/80 transition-colors"
                      >
                        {/* Danh mục cấp 2 */}
                        <Link
                          href={getSafeLink(lvl2)}
                          className="font-bold text-gray-800 text-[14px] hover:text-orange-600 transition-colors leading-snug"
                        >
                          {lvl2.name}
                        </Link>

                        {/* Danh mục cấp 3 - HIỂN THỊ FULL 100% */}
                        {lvl2.children && lvl2.children.length > 0 && (
                          <div className="flex flex-col gap-1.5 pl-1 border-l-2 border-gray-200/50 ml-0.5">
                            {lvl2.children.map((lvl3) => (
                              <Link
                                key={lvl3.id}
                                href={getSafeLink(lvl3)}
                                className="font-normal text-gray-500 text-[13px] hover:text-orange-600 hover:font-medium transition-colors leading-snug"
                              >
                                {lvl3.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !loading && (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Chọn danh mục
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;