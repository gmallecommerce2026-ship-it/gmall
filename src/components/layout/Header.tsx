// src/components/layout/Header.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";

// Components
import TopBar from "./Topbar";
import MegaMenu from "./Header/MegaMenu";
import AdvancedSearchBar from "./Header/AdvancedSearchBar";
import UserAccountDropdown from "./Header/UserAccountDropdown";
import { HeaderIcons as Icons } from "./Header/HeaderIcons";
import MobileMenu from "./Header/MobileMenu"; // [MỚI] Import Sidebar Mobile

// Components Popup
import MiniCartPopup from "./Header/MiniCartPopup";
import NotificationPopup from "./Header/NotificationPopup";
import CategoryNavBar from "@/modules/home/components/CategoryNavBar";
import NavOverlay from "./Header/NavOverlay";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);
  const { user, logout } = useUserStore();
  const pathname = usePathname();
  const [paddingRightFix, setPaddingRightFix] = useState(0);
  
  // State cho Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = pathname === "/";

  // Sticky Logic — spec [0018]:
  // - Ẩn header khi cuộn XUỐNG (qua threshold 150px) để giảm chiếm diện tích.
  // - Hiện lại ngay khi cuộn LÊN, dạng sticky overlay.
  // - Trên trang chủ và cả các trang khác (B4.1).
  const [isSticky, setIsSticky] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      // Threshold 8px tránh jitter khi scroll rất chậm
      if (Math.abs(delta) > 8) {
        if (delta > 0 && y > 150) {
          // Cuộn xuống và đã qua 150px -> ẩn
          setIsHidden(true);
        } else if (delta < 0) {
          // Cuộn lên -> hiện lại
          setIsHidden(false);
        }
        lastScrollY.current = y;
      }
      setIsSticky(y > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isSticky, mounted, isHomePage]);

  const handleMegaMenuChange = (isOpen: boolean, width: number) => {
    setPaddingRightFix(width);
  };

  return (
    <div className="w-full flex flex-col relative z-50 font-roboto">
      
      {/* 1. Top Bar: Ẩn hoàn toàn trên Mobile */}
      <div className="hidden lg:block w-full relative bg-white z-[60]">
        <div className="w-full bg-gradient-to-r from-[#FFF0F0] to-[#FFF8F0] h-[32px]">
            <div className="max-w-[1340px] mx-auto px-4 h-full flex items-center justify-center text-xs text-gray-600">
                🎉 Trở thành đối tác Affiliate - Kiếm thu nhập không giới hạn - <Link href="/affiliate/dashboard" className="text-brand-orange font-bold ml-1 hover:underline">Xem ngay</Link>
            </div>
        </div>
        <TopBar />
      </div>

      {/* 2. Placeholder Sticky */}
      {isSticky && <div className="hidden lg:block h-[80px] w-full" />}
      {/* Mobile Sticky Placeholder (Chiều cao nhỏ hơn cho mobile nếu muốn sticky cả mobile) */}
      {isSticky && <div className="lg:hidden h-[110px] w-full" />} 

      {/* 3. Main Header */}
      <header
        ref={headerRef}
        style={{
          paddingRight: isSticky ? `${paddingRightFix}px` : 0,
          // Ẩn bằng translate (mượt hơn `display:none`, vẫn hold layout space).
          transform: isSticky && isHidden ? 'translateY(-100%)' : 'translateY(0)',
        }}
        className={`w-full bg-white ease-out border-b border-gray-100
          ${isSticky
            ? "fixed top-0 left-0 right-0 shadow-lg shadow-gray-200/50 z-[999] lg:py-2 transition-[transform,opacity] duration-300"
            : "relative z-50 lg:py-4 transition-[transform,opacity] duration-300"
          }`}
      >
        {/* --- MOBILE LAYOUT (HIỆN KHI MÀN HÌNH < LG) --- */}
        <div className="lg:hidden w-full pb-2">
            {/* Hàng 1: Toggle + Logo */}
            <div className="flex items-center justify-between px-4 py-3">
                {/* Toggle Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full"
                >
                    <Icons.Menu className="w-7 h-7" />
                </button>

                {/* Logo Center */}
                <Link href="/" className="flex-shrink-0">
                    <img src="/images/gmall-logo.png" alt="GMall" className="h-[32px] w-auto object-contain" />
                </Link>

                {/* Dummy div để căn giữa Logo hoặc Icon Chat/Cart nếu muốn (Hiện tại để trống theo yêu cầu ẩn Cart) */}
                <div className="w-9" /> 
            </div>

            {/* Hàng 2: Sub-header Search */}
            <div className="px-4 pb-2">
                <AdvancedSearchBar />
            </div>
        </div>


        {/* --- DESKTOP LAYOUT (HIỆN KHI MÀN HÌNH >= LG) --- */}
        <div className="hidden lg:block w-full max-w-[1340px] mx-auto px-4 lg:px-6 mb-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <Link href="/" className="flex-shrink-0 group">
              <img src="/images/gmall-logo.png" alt="GMall" className="w-[160px] h-auto object-contain transition-transform group-hover:scale-105" />
            </Link>

            <div className="flex-1 max-w-[700px] flex-col relative z-100">
              <AdvancedSearchBar />
              <div className={`flex gap-3 mt-1.5 px-1 overflow-hidden transition-all duration-300 ${isSticky ? 'h-0 opacity-0 mt-0' : 'h-auto opacity-100'}`}>
                {["Váy trễ vai", "Son BlackRouge", "Túi Canvas", "Quà sinh nhật"].map((tag) => (
                  <Link key={tag} href={`/search?q=${tag}`} className="text-[11px] text-gray-500 hover:text-brand-orange transition-colors">{tag}</Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
              {/* Desktop Icons */}
              <div className="group relative py-2">
                <Link href="user/notifications" className="relative block p-1.5 hover:bg-gray-50 rounded-full transition-colors">
                  <Icons.Bell className="w-[26px] h-[26px] text-gray-600 group-hover:text-brand-orange transition-colors" />
                  <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">3</span>
                </Link>
                <div className="absolute top-[calc(100%-5px)] -right-[100px] sm:right-0 pt-2 hidden group-hover:block z-[100]">
                    <NotificationPopup />
                </div>
              </div>

              <div className="group relative py-2">
                 <Link href="/cart" className="relative block p-1.5 hover:bg-gray-50 rounded-full transition-colors">
                    <Icons.Cart className="w-[26px] h-[26px] text-gray-600 group-hover:text-brand-orange transition-colors" />
                    <span className="absolute top-0 -right-1 h-4 min-w-[16px] px-1 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">{mounted ? totalItems : 0}</span>
                 </Link>
                 <div className="absolute top-[calc(100%-5px)] right-0 pt-2 hidden group-hover:block z-[100]">
                     <MiniCartPopup />
                 </div>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>
              <UserAccountDropdown user={user} logout={logout} />
            </div>
          </div>
        </div>

        {/* --- NAVIGATION BAR & MEGA MENU (Chỉ Desktop) --- */}
        {isHomePage && (
          <div className={`hidden lg:block border-t border-gray-100 bg-white relative transition-all block`}>
            <div className="max-w-[1340px] mx-auto px-4 flex items-stretch gap-8 h-[50px] relative">
              <div className="flex-shrink-0 w-[240px]">
                <MegaMenu 
                    isSticky={isSticky} 
                    headerHeight={headerHeight} 
                    onMenuOpenChange={handleMegaMenuChange}
                />
              </div>
              <div className="flex-1 flex items-center">
                <CategoryNavBar />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- SIDEBAR MOBILE --- */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <NavOverlay />
      
      {/* CSS Slide Down Animation */}
      <style jsx global>{`
          @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Header;