/* src/modules/home/components/HeroRightSidebar.tsx */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore"; 
import { AuthService } from "@/services/AuthService"; 
import { SIDEBAR_IMAGES } from "../data/heroData"; 

// --- DỮ LIỆU SLIDE QUẢNG CÁO (MOCK DATA) ---
// Bạn có thể chuyển phần này sang file heroData.ts nếu muốn gọn code
const GUEST_PROMOS = [
  {
    id: 1,
    badge: "Hot Deal",
    badgeColor: "bg-orange-500",
    title: "Gói quà Welcome Member trị giá",
    highlight: "200k",
    image: SIDEBAR_IMAGES.promoBg, // Có thể thay ảnh khác
  },
  {
    id: 2,
    badge: "Free Ship",
    badgeColor: "bg-green-500",
    title: "Miễn phí vận chuyển cho đơn hàng từ",
    highlight: "150k",
    image: SIDEBAR_IMAGES.promoBg, 
  },
  {
    id: 3,
    badge: "New",
    badgeColor: "bg-blue-500",
    title: "Đăng ký ngay để nhận voucher",
    highlight: "50%",
    image: SIDEBAR_IMAGES.promoBg,
  }
];

const MEMBER_PROMOS = [
  {
    id: 1,
    badge: "Member Deal",
    badgeColor: "bg-orange-500",
    title: "Ưu đãi dành riêng cho thành viên thân thiết",
    highlight: "",
    image: SIDEBAR_IMAGES.promoBg,
  },
  {
    id: 2,
    badge: "Voucher",
    badgeColor: "bg-red-500",
    title: "Bạn có 2 voucher sắp hết hạn",
    highlight: "Dùng ngay",
    image: SIDEBAR_IMAGES.promoBg,
  },
  {
    id: 3,
    badge: "Tích điểm",
    badgeColor: "bg-yellow-500",
    title: "Đổi 1000 điểm lấy quà tặng",
    highlight: "Limited",
    image: SIDEBAR_IMAGES.promoBg,
  }
];

export const HeroRightSidebar = () => {
  const user = useUserStore((state) => state.user);
  
  // State cho Carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  // Xác định danh sách slide dựa trên trạng thái đăng nhập
  const slides = user ? MEMBER_PROMOS : GUEST_PROMOS;

  const handleLogout = () => {
    AuthService.logout();
  };

  // Tự động chuyển slide (Auto-play)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 giây chuyển 1 lần

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full h-full flex flex-col items-center py-6 px-4 bg-white rounded-[4px] border border-gray-100 shadow-sm overflow-hidden relative group/sidebar">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-b from-orange-50/50 to-transparent z-0" />

      <div className="relative z-10 flex flex-col items-center w-full h-full">
        {/* --- PHẦN 1: AVATAR & WELCOME (GIỮ NGUYÊN) --- */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="relative p-1 rounded-full border border-gray-100 bg-white shadow-sm">
            <img
              src={user?.avatar || SIDEBAR_IMAGES.avatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={`absolute bottom-1 right-1 w-3 h-3 border-2 border-white rounded-full ${user ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
           
          <div className="text-center">
            <span className="block text-xs text-gray-500 font-medium mb-0.5">
              {user ? "Xin chào," : "Chào ngày mới,"}
            </span>
            <h3 className="font-sans text-sm font-bold text-gray-800 truncate max-w-[180px]">
              {user ? (user.name || user.email) : "Bạn của LoveGifts"}
            </h3>
          </div>
        </div>

        {/* --- PHẦN 2: ACTION BUTTONS (GIỮ NGUYÊN) --- */}
        <div className="flex gap-3 w-full mb-6">
          {user ? (
            <>
              {user.role === 'SELLER' ? (
                 <Link href="/seller-dashboard" className="flex-1 py-2.5 text-xs font-bold text-white bg-brand-orange border border-transparent rounded-[4px] text-center hover:bg-brand-orange-dark shadow-sm transition-all">
                   Kênh Bán Hàng
                 </Link>
              ) : (
                 <Link href="user/profile" className="flex-1 py-2.5 text-xs font-bold text-brand-orange bg-orange-50 border border-brand-orange/20 rounded-[4px] text-center hover:bg-brand-orange hover:text-white transition-all">
                   Tài khoản
                 </Link>
              )}
              
              <button 
                onClick={handleLogout}
                className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-[4px] text-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex-1 py-2.5 text-xs font-bold text-brand-orange bg-orange-50 border border-brand-orange/20 rounded-[4px] text-center hover:bg-brand-orange hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  Đăng nhập
              </Link>
              <Link href="/register" className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-[4px] text-center hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* --- PHẦN 3: PROMO CAROUSEL (MỚI) --- */}
        {/* Container chính của Carousel */}
        <div className="flex-1 w-full relative rounded-[4px] overflow-hidden group cursor-pointer border border-gray-100 shadow-inner isolate">
            
            {/* Render các Slides */}
            {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                    <div 
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {/* Ảnh Background */}
                        <img 
                            src={slide.image}
                            alt="Promotion"
                            className={`w-full h-full object-cover transition-transform duration-[2000ms] ${isActive ? 'scale-110' : 'scale-100'}`}
                        />
                        
                        {/* Overlay Gradient & Nội dung */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                            {/* Badge */}
                            <span className={`inline-block px-2 py-0.5 text-white text-[9px] font-bold uppercase tracking-wider rounded-sm w-fit mb-2 shadow-sm ${slide.badgeColor}`}>
                                {slide.badge}
                            </span>
                            
                            {/* Title & Highlight */}
                            <p className="font-sans text-sm text-white font-bold leading-snug drop-shadow-md line-clamp-2">
                                {slide.title}
                                {slide.highlight && (
                                    <> <span className="text-orange-300">{slide.highlight}</span></>
                                )}
                            </p>
                            
                            {/* Decorative Line (Loading Bar giả lập) */}
                            <div className={`h-0.5 bg-orange-500 mt-2 transition-all duration-[4000ms] ease-linear ${isActive ? 'w-full' : 'w-0'}`}></div>
                        </div>
                    </div>
                );
            })}

            {/* Dots Indicators (Điều hướng chấm tròn) */}
            <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.preventDefault(); 
                            setCurrentSlide(idx);
                        }}
                        className={`h-1 rounded-full transition-all duration-300 shadow-sm ${
                            currentSlide === idx ? 'w-4 bg-orange-500' : 'w-1 bg-white/50 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
            
        </div>
      </div>
    </div>
  );
};