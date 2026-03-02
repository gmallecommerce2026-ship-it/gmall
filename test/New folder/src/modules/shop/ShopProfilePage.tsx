"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChatBubbleLeftEllipsisIcon, 
  PlusIcon, 
  StarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ShoppingBagIcon 
} from "@heroicons/react/24/outline";

// --- 1. TYPES ---
interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  isHighlight?: boolean;
}

interface Voucher {
  id: string;
  discount: string;
  minOrder: string;
  expiry: string;
  percentage: string;
}

// --- 2. COMPONENTS CON ---

/**
 * Component hiển thị thông tin thống kê của Shop (Sản phẩm, Đánh giá...)
 */
const ShopStatItem = ({ icon, label, value, isHighlight }: StatItem) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="text-gray-400 w-5 h-5">{icon}</div>
    <span className="text-gray-600 font-normal">{label}:</span>
    <span className={`font-medium ${isHighlight ? "text-brand-orange" : "text-brand-orange"}`}>
      {value}
    </span>
  </div>
);

/**
 * Thẻ Voucher (Ticket Style)
 */
const VoucherCard = ({ voucher }: { voucher: Voucher }) => (
  <div className="relative flex w-[320px] h-[118px] bg-orange-50/50 border border-brand-orange/30 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow shrink-0">
    {/* Phần nội dung bên trái */}
    <div className="flex-1 flex flex-col justify-center px-4 py-2 gap-1 border-r border-dashed border-brand-orange/30 relative">
      {/* Răng cưa trang trí (CSS trick hoặc SVG) - Ở đây dùng border-dashed đơn giản */}
      <div className="flex flex-col items-start">
        <span className="text-brand-orange font-bold text-lg">{voucher.discount}</span>
        <span className="text-brand-orange text-xs">Đơn tối thiểu {voucher.minOrder}</span>
      </div>
      <span className="text-[10px] text-gray-500 mt-2">HSD: {voucher.expiry}</span>
      
      {/* Circles trang trí mô phỏng vé */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border border-brand-orange/30 z-10"></div>
      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border border-brand-orange/30 z-10"></div>
    </div>

    {/* Phần nút bấm bên phải */}
    <div className="w-[80px] flex flex-col items-center justify-center bg-white p-2">
      <button className="bg-brand-orange text-white text-xs font-medium px-4 py-1.5 rounded shadow-sm hover:bg-brand-orange-dark transition-colors">
        Lưu
      </button>
    </div>
  </div>
);

/**
 * Navigation Tabs (Giống Shopee: Dạo, Tất cả sản phẩm...)
 */
const ShopTabs = ({ activeTab, onChange }: { activeTab: string; onChange: (t: string) => void }) => {
  const tabs = [
    { id: "home", label: "Dạo" },
    { id: "all_products", label: "Tất cả sản phẩm" },
    { id: "collection", label: "Bộ sưu tập" },
    { id: "rating", label: "Đánh giá" },
    { id: "profile", label: "Hồ sơ Shop" },
  ];

  return (
    <div className="w-full bg-white sticky top-[70px] z-30 shadow-sm border-b border-gray-100">
      <div className="max-w-[1340px] mx-auto flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 py-4 text-base font-medium transition-colors text-center relative
              ${activeTab === tab.id ? "text-brand-orange" : "text-gray-700 hover:text-brand-orange"}
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-orange rounded-t-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---

const ShopProfilePage = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Mock Data (Stats)
  const leftStats: StatItem[] = [
    { icon: <ShoppingBagIcon />, label: "Sản phẩm", value: "2,4K" },
    { icon: <UserGroupIcon />, label: "Đang Theo dõi", value: "5" },
    { icon: <ChatBubbleLeftEllipsisIcon />, label: "Phản hồi Chat", value: "100% (Trong vài giờ)" },
  ];

  const rightStats: StatItem[] = [
    { icon: <UserGroupIcon />, label: "Người theo dõi", value: "24.5K" },
    { icon: <StarIcon />, label: "Đánh giá", value: "4.9 (12.2k đánh giá)" },
    { icon: <ClockIcon />, label: "Tham gia", value: "5 năm trước" },
  ];

  // Mock Data (Vouchers)
  const vouchers: Voucher[] = [
    { id: "1", discount: "Giảm 10k", minOrder: "200k", expiry: "31.12.2025", percentage: "10%" },
    { id: "2", discount: "Giảm 50%", minOrder: "0đ", expiry: "31.12.2025", percentage: "50%" },
    { id: "3", discount: "Hoàn 15k Xu", minOrder: "150k", expiry: "31.12.2025", percentage: "15k" },
    { id: "4", discount: "Freeship Xtra", minOrder: "50k", expiry: "31.12.2025", percentage: "100%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* === SECTION 1: SHOP HEADER & INFO === */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-[1340px] mx-auto p-5">
          
          {/* Card Info Container */}
          <div className="bg-white rounded-xl overflow-hidden flex flex-col lg:flex-row gap-6 lg:gap-12">
            
            {/* Left: Avatar & Actions (Nền xám/ảnh bìa mờ) */}
            <div className="lg:w-[400px] w-full relative rounded-xl overflow-hidden bg-[url('/assets/shop-cover-bg.png')] bg-cover bg-center">
              {/* Overlay tối để text dễ đọc nếu có ảnh nền */}
              <div className="absolute inset-0 bg-black/60 z-0"></div>
              
              <div className="relative z-10 flex flex-row items-center gap-4 p-5 h-full">
                {/* Avatar */}
                <div className="relative w-20 h-20 rounded-full border-2 border-white/80 overflow-hidden shrink-0">
                  <Image 
                    src="/assets/ImageAsset1.png" 
                    alt="Shop Avatar" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-brand-orange text-white text-[9px] text-center font-bold py-0.5">
                    Yêu thích
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex flex-col text-white">
                  <h1 className="text-xl font-bold line-clamp-1">ABC Shop Official</h1>
                  <span className="text-xs text-white/80 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online 4 phút trước
                  </span>
                </div>
              </div>

              {/* Action Buttons (Absolute or Flex bottom) */}
              <div className="absolute bottom-4 left-5 right-5 flex gap-3 z-10">
                <button className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-white text-white py-1.5 px-3 rounded text-sm font-medium hover:bg-white/10 transition-colors uppercase">
                  <PlusIcon className="w-4 h-4" /> Theo dõi
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white text-brand-orange py-1.5 px-3 rounded text-sm font-medium hover:bg-gray-100 transition-colors uppercase shadow-md">
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> Chat Ngay
                </button>
              </div>
            </div>

            {/* Right: Statistics Grid */}
            <div className="flex-1 py-2 lg:py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-3">
                {leftStats.map((stat, idx) => (
                  <ShopStatItem key={idx} {...stat} />
                ))}
              </div>
              <div className="flex flex-col gap-3 border-l border-gray-100 pl-0 sm:pl-8">
                {rightStats.map((stat, idx) => (
                  <ShopStatItem key={idx} {...stat} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* === SECTION 2: NAVIGATION TABS === */}
      <ShopTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* === SECTION 3: MAIN CONTENT === */}
      <div className="max-w-[1340px] mx-auto px-4 mt-6 flex flex-col gap-8">
        
        {/* 3.1 Voucher Section (Horizontal Scroll) */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">Mã giảm giá của Shop</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {vouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
            {/* Dummy vouchers to show scroll */}
            {vouchers.map((v) => (
              <VoucherCard key={`${v.id}-copy`} voucher={v} />
            ))}
          </div>
        </div>

        {/* 3.2 Product Showcase (Gợi ý cho bạn / Sản phẩm bán chạy) */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 uppercase border-l-4 border-brand-orange pl-3">
                Sản phẩm bán chạy
              </h3>
              <Link href="#" className="text-brand-orange text-sm hover:underline">Xem tất cả &gt;</Link>
           </div>

           {/* Product Grid - Mock UI */}
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-lg hover:shadow-md hover:border-brand-orange transition-all cursor-pointer overflow-hidden group">
                   <div className="relative w-full aspect-square bg-gray-200">
                      <Image 
                        src={`/assets/product-placeholder.png`} // Thay bằng ảnh thật
                        alt="Product"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {i < 3 && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-xs font-bold px-1.5 py-0.5">
                          -50%
                        </div>
                      )}
                   </div>
                   <div className="p-2.5">
                      <h4 className="text-xs text-gray-800 line-clamp-2 mb-2 min-h-[32px]">
                        Áo thun nam nữ form rộng tay lỡ Unisex vải cotton khô thoáng
                      </h4>
                      <div className="flex items-center justify-between">
                         <span className="text-brand-orange font-bold text-sm">159.000đ</span>
                         <span className="text-[10px] text-gray-500">Đã bán 1.2k</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ShopProfilePage;