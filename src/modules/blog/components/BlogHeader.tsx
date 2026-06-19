// src/modules/blog/components/BlogHeader.tsx
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, ShoppingBag, ChevronDown } from 'lucide-react';
import { buildCategoryTree } from '@/modules/blog/utils';
import { Category } from '@/types/blog'; // Import Category type

export const BlogHeader = ({ categories, onSearch, searchValue, onCategorySelect }: any) => {
  // Biến đổi flat list thành tree cho menu
  const categoryTree = useMemo(() => buildCategoryTree(categories || []), [categories]);

  // [FIX wiki 0092] Ngày thật thay placeholder cứng "Tuesday, May 12, 2026". Set trong useEffect
  // (client-only) → tránh hydration mismatch khi TZ server/client khác nhau gần nửa đêm.
  const [today, setToday] = useState('');
  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
    );
  }, []);

  // [FIX wiki 0092] Menu danh mục mobile — trước nút ☰ không có onClick → mobile không mở được danh mục.
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectAndClose = (slug: string) => {
    setMobileOpen(false);
    onCategorySelect(slug);
  };

  return (
    <header className="w-full bg-white font-sans">
      {/* 1. Top Utility Bar (Black) */}
      <div className="bg-black text-white text-[10px] py-1.5 px-4">
        <div className="container mx-auto flex justify-between items-center">
            <span className="opacity-80 capitalize">{today}</span>
            <div className="flex gap-4 font-bold uppercase tracking-wider">
                <Link href="/" className="hover:text-blue-400 transition">Về G-Mall</Link>
                <Link href="/shop" className="hover:text-blue-400 transition">Cửa hàng</Link>
                <Link href="/login" className="hover:text-blue-400 transition">Đăng nhập</Link>
            </div>
        </div>
      </div>

      {/* 2. Main Logo Area */}
      <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/blog" className="group">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black group-hover:opacity-80 transition">
                    GMALL<span className="text-blue-600">.MAG</span>
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] text-center md:text-left mt-1">
                    Tạp chí đời sống & mua sắm
                </p>
            </Link>
            <div className="hidden lg:flex w-[600px] h-[70px] bg-gray-100 border border-dashed border-gray-300 items-center justify-center text-xs text-gray-400 rounded-[3px]">
                ADVERTISEMENT AREA
            </div>
          </div>
      </div>

      {/* 3. Sticky Navbar (Nested Menu) */}
      <div className="sticky top-0 z-50 bg-white border-b-2 border-gray-900 shadow-sm">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
                <button className="md:hidden p-2 text-black" onClick={() => setMobileOpen((o) => !o)} aria-label="Mở menu danh mục"><Menu size={24}/></button>

                <nav className="hidden md:flex gap-1 h-full">
                    <button 
                        onClick={() => onCategorySelect('')}
                        className="h-full px-4 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center border-r border-gray-100"
                    >
                        Trang chủ
                    </button>
                    
                    {/* Render Category Tree — [FIX wiki 0092] slice(0,8) khớp trang chủ (8 danh mục gốc),
                        trước slice(0,7) cắt mất danh mục gốc thứ 8 ("HỖ TRỢ KHÁCH HÀNG") khỏi menu */}
                    {categoryTree.slice(0, 8).map((cat: Category) => (
                        <div key={cat.id} className="group relative h-full flex items-center">
                            <button 
                                onClick={() => onCategorySelect(cat.slug)}
                                className="h-full px-4 text-xs font-bold uppercase group-hover:bg-black group-hover:text-white transition-colors flex items-center gap-1"
                            >
                                {cat.name}
                                {cat.children && cat.children.length > 0 && <ChevronDown size={12} />}
                            </button>

                            {/* Dropdown for Subcategories */}
                            {cat.children && cat.children.length > 0 && (
                                <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-xl min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left z-50">
                                    <div className="py-2 flex flex-col">
                                        {cat.children.map(child => (
                                            <button
                                                key={child.id}
                                                onClick={() => onCategorySelect(child.slug)}
                                                className="text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors uppercase"
                                            >
                                                {child.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <div className="relative hidden sm:block">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            value={searchValue}
                            onChange={(e) => onSearch(e.target.value)}
                            className="pl-3 pr-8 py-1.5 text-xs bg-gray-100 rounded-full focus:bg-white focus:ring-1 focus:ring-black transition-all w-32 focus:w-48 outline-none"
                        />
                        <Search className="absolute right-2.5 top-1.5 w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full"><ShoppingBag size={18} /></button>
                </div>
            </div>

            {/* [FIX wiki 0092] Mobile drawer danh mục — bấm ☰ mở; hiện đủ danh mục gốc + con (scroll được) */}
            {mobileOpen && (
              <div className="md:hidden border-t border-gray-100 py-2 max-h-[70vh] overflow-y-auto">
                <button onClick={() => selectAndClose('')} className="w-full text-left px-2 py-2.5 text-xs font-bold uppercase hover:bg-gray-100">Trang chủ</button>
                {categoryTree.map((cat: Category) => (
                  <div key={cat.id} className="border-t border-gray-50">
                    <button onClick={() => selectAndClose(cat.slug)} className="w-full text-left px-2 py-2.5 text-xs font-bold uppercase hover:bg-gray-100">
                      {cat.name}
                    </button>
                    {cat.children && cat.children.length > 0 && (
                      <div className="flex flex-col pb-1">
                        {cat.children.map((child) => (
                          <button key={child.id} onClick={() => selectAndClose(child.slug)} className="text-left pl-6 pr-2 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 uppercase">
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </header>
  );
};