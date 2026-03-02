// src/components/layout/Header.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // [MỚI] Import usePathname
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";

// Components
import TopBar from "./Topbar";
import { CategoryNavBar } from "@/modules/home/components/CategoryNavBar";
import MegaMenu from "./Header/MegaMenu";
import AdvancedSearchBar from "./Header/AdvancedSearchBar";
import UserAccountDropdown from "./Header/UserAccountDropdown";
import { HeaderIcons as Icons } from "./Header/HeaderIcons";

// Components Popup
import MiniCartPopup from "./Header/MiniCartPopup";
import NotificationPopup from "./Header/NotificationPopup";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);
  const { user, logout } = useUserStore();
  const pathname = usePathname(); // [MỚI] Lấy đường dẫn hiện tại
  
  // Kiểm tra xem có phải trang chủ không
  const isHomePage = pathname === "/";

  // Sticky & Height Logic
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null); 

  // [SỬA ĐỔI] Chỉ kích hoạt Sticky khi ở HomePage
  useEffect(() => {
    setMounted(true);

    if (!isHomePage) {
      setIsSticky(false); // Reset sticky nếu không phải trang chủ
      return;
    }

    const handleScroll = () => {
      // Chỉ set sticky khi ở trang chủ
      if (isHomePage) {
        setIsSticky(window.scrollY > 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]); // Thêm dependency isHomePage

  // Đo chiều cao thực tế của Header khi Sticky thay đổi
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
      const timer = setTimeout(() => {
         if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
         }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSticky, mounted, isHomePage]); // Recalculate khi đổi trang

  return (
    <div className="w-full flex flex-col relative z-50 font-roboto">
      
      {/* 1. Top Bar (sẽ ẩn khi scroll ở trang chủ, luôn hiện ở trang khác nếu muốn logic đó, hoặc giữ nguyên behavior) */}
      <div ref={topRef} className="w-full relative bg-white z-[60]">
        <div className="hidden lg:block w-full bg-gradient-to-r from-[#FFF0F0] to-[#FFF8F0] h-[32px]">
            <div className="max-w-[1340px] mx-auto px-4 h-full flex items-center justify-center text-xs text-gray-600">
                🎉 Trở thành đối tác Affiliate - Kiếm thu nhập không giới hạn - <Link href="/affiliate/dashboard" className="text-brand-orange font-bold ml-1 hover:underline">Xem ngay</Link>
            </div>
        </div>
        <TopBar />
      </div>

      {/* 2. Placeholder để tránh giật layout khi sticky (Chỉ hiện khi sticky kích hoạt - tức là chỉ ở Home) */}
      {isSticky && <div className="h-[80px] w-full" />}

      {/* 3. Main Header */}
      <header 
        ref={headerRef}
        className={`w-full bg-white ease-out border-b border-gray-100
          ${/* CHÚ Ý: Logic class dựa trên isSticky (vốn chỉ true ở Home khi scroll) */ ""}
          ${isSticky 
            ? "fixed top-0 left-0 right-0 shadow-lg shadow-gray-200/50 z-[999] animate-slideDown py-2 transition-[transform,opacity] duration-300" 
            : "relative z-50 py-4 transition-[transform,opacity] duration-300"
          }`}
      >
        <style jsx global>{`
          @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
        `}</style>

        {/* --- MAIN ROW: LOGO, SEARCH, ICONS --- */}
        <div className="w-full max-w-[1340px] mx-auto px-4 lg:px-6 mb-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* LOGO */}
            <Link href="/" className="flex-shrink-0 group">
              <img src="/assets/ImageAsset124.png" alt="LoveGifts" className="w-[160px] h-auto object-contain transition-transform group-hover:scale-105" />
            </Link>

            {/* SEARCH BAR */}
            <div className="hidden md:flex flex-1 max-w-[700px] flex-col relative z-50">
              <AdvancedSearchBar />
              
              {/* Tags - Ẩn tags khi sticky ở trang chủ */}
              <div className={`flex gap-3 mt-1.5 px-1 overflow-hidden transition-all duration-300 ${isSticky ? 'h-0 opacity-0 mt-0' : 'h-auto opacity-100'}`}>
                {["Váy trễ vai", "Son BlackRouge", "Túi Canvas", "Quà sinh nhật"].map((tag) => (
                  <Link key={tag} href={`/search?q=${tag}`} className="text-[11px] text-gray-500 hover:text-brand-orange transition-colors">{tag}</Link>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
              
              {/* Notification */}
              <div className="group relative py-2">
                <Link href="user/notifications" className="relative block p-1.5 hover:bg-gray-50 rounded-full transition-colors">
                  <Icons.Bell className="w-[26px] h-[26px] text-gray-600 group-hover:text-brand-orange transition-colors" />
                  <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">3</span>
                </Link>
                <div className="absolute top-[calc(100%-5px)] -right-[100px] sm:right-0 pt-2 hidden group-hover:block z-[100]">
                    <NotificationPopup />
                </div>
              </div>

              {/* Cart */}
              <div className="group relative py-2">
                 <Link href="/cart" className="relative block p-1.5 hover:bg-gray-50 rounded-full transition-colors">
                    <Icons.Cart className="w-[26px] h-[26px] text-gray-600 group-hover:text-brand-orange transition-colors" />
                    <span className="absolute top-0 -right-1 h-4 min-w-[16px] px-1 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">{mounted ? totalItems : 0}</span>
                 </Link>
                 <div className="absolute top-[calc(100%-5px)] right-0 pt-2 hidden group-hover:block z-[100]">
                     <MiniCartPopup />
                 </div>
              </div>

              <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

              {/* User Dropdown */}
              <div className="hidden md:block">
                <UserAccountDropdown user={user} logout={logout} />
              </div>

            </div>
          </div>
        </div>

        {/* --- NAVIGATION BAR & MEGA MENU --- */}
        {/* [SỬA ĐỔI] Chỉ hiển thị phần này nếu đang ở trang chủ (isHomePage) */}
        {isHomePage && (
          <div className={`hidden md:block border-t border-gray-100 bg-white relative transition-all block`}>
            <div className="max-w-[1340px] mx-auto px-4 flex items-stretch gap-8 h-[50px] relative">
              <div className="flex-shrink-0 w-[240px]">
                {/* Truyền chiều cao thực tế xuống để tính toán */}
                <MegaMenu 
                    isSticky={isSticky} 
                    headerHeight={headerHeight} 
                />
              </div>
              <div className="flex-1 flex items-center">
                <CategoryNavBar />
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;