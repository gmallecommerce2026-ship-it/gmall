// src/app/(main)/shop/page.tsx
"use client";

import React from "react";
import Image from "next/image";

// --- Types & Interfaces ---

interface StatItemProps {
  label: string;
  isWide?: boolean;
  isGray?: boolean;
}

interface TabItemProps {
  label: string;
  isActive?: boolean;
  isLargeText?: boolean;
  isOrangeText?: boolean;
}

// --- Sub-Components ---

const ShopStatItem = ({ label, isWide = false, isGray = false }: StatItemProps) => (
  <div
    className={`
      font-sans text-[16px] leading-[22px] font-medium whitespace-nowrap
      ${isWide ? "min-w-[252px]" : "min-w-[354px]"}
      ${isGray ? "text-black/60" : "text-[#E78720]"}
    `}
  >
    {label}
  </div>
);

const ShopTabItem = ({ label, isActive, isLargeText, isOrangeText }: TabItemProps) => (
  <div
    className={`
      flex flex-col justify-center items-center cursor-pointer h-[45px] px-4
      ${isActive ? "border-b-[5px] border-[#E78720]" : "border-b-[5px] border-transparent"}
    `}
  >
    <span
      className={`
        font-sans whitespace-nowrap leading-[140%]
        ${isLargeText ? "text-[20px]" : "text-[18px]"}
        ${isOrangeText ? "text-[#E78720]" : "text-[#081F24]"}
        ${isActive ? "font-medium" : "font-normal"}
      `}
    >
      {label}
    </span>
  </div>
);

const ShopVoucherCard = () => (
  <div className="relative w-full max-w-[320px] h-[128px] bg-[#E78720]/10 border border-[#E78720] rounded-[2px] shadow-sm flex items-center pr-[13px] pl-[11px] gap-[7px]">
    {/* Left Content */}
    <div className="flex justify-between items-center gap-[6px] flex-1 h-[126px]">
      <div className="flex flex-col justify-start items-start h-[71px]">
        {/* Title */}
        <div className="flex flex-col justify-center items-center w-[77px] h-[24px]">
          <span className="font-sans text-[15px] text-[#E78720] font-medium leading-[24px] whitespace-nowrap">
            Giảm 10k₫
          </span>
        </div>
        {/* Subtitle */}
        <div className="flex justify-start items-center w-full h-[22px]">
          <span className="font-sans text-[13px] text-[#E78720] font-normal leading-[22px] whitespace-nowrap">
            Đơn Tối Thiểu 200k₫
          </span>
        </div>
        {/* Expiry */}
        <div className="mt-[5px] flex flex-col justify-end items-center h-[20px]">
          <div className="flex justify-start items-center w-full h-[16px]">
            <span className="font-sans text-[10px] text-black/55 leading-[16px] font-normal whitespace-nowrap">
              HSD: 31.12.2025
            </span>
          </div>
        </div>
      </div>
      
      {/* Dashed Separator Simulation */}
      <div className="w-[1px] h-[126px] bg-gradient-to-b from-gray-200 via-transparent to-gray-200" />
    </div>

    {/* Right Action Button */}
    <button className="bg-[#E78720] rounded-[2px] w-[60px] h-[34px] shadow-sm flex justify-center items-center hover:bg-[#d67610] transition-colors">
      <span className="font-sans text-[14px] text-white text-center leading-[17px] capitalize font-normal">
        Lưu
      </span>
    </button>
  </div>
);

// --- Data Constants ---

const LEFT_STATS = [
  { label: "Sản phẩm: 2,4K", isWide: true, isGray: true },
  { label: "Đang Theo dõi: 5", isWide: true, isGray: true },
  { label: "Tỉ lệ phản hồi Chat: 100% (trong vài giờ)", isWide: false, isGray: false },
];

const RIGHT_STATS = [
  { label: "Người theo dõi: 2,4K", isWide: true, isGray: true },
  { label: "Đánh giá: 1,1 ( 2k đánh giá )", isWide: true, isGray: true },
  { label: "Tham gia: 5 năm trước", isWide: false, isGray: false },
];

// Giả lập danh sách tabs (1 tab active đầu tiên)
const TABS_DATA = Array(5).fill(null).map((_, index) => ({
  label: index === 0 ? "Dạo" : `Danh mục ${index}`,
  isActive: index === 0,
  isLargeText: index === 0,
  isOrangeText: index === 0,
}));

// --- Main Page Component ---

const ShopClient = () => {
  return (
    <div className="flex flex-col gap-[18px] w-full max-w-[1438px] mx-auto pb-10">
      
      {/* SECTION 1: SHOP HEADER INFO & TABS */}
      <div className="bg-white rounded-[20px] w-full flex flex-col p-6 gap-5 shadow-sm">
        
        {/* Top Area: Shop Info + Stats */}
        <div className="flex flex-col xl:flex-row items-start gap-10 xl:gap-[100px] w-full">
          
          {/* Shop Avatar & Actions Card */}
          <div className="bg-[#F0F0F0] rounded-lg p-4 flex items-end gap-4 min-w-[372px] h-[130px]">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
               {/* Thay thế src bằng ảnh thật hoặc placeholder */}
               <div className="w-full h-full bg-gray-300 rounded-full overflow-hidden">
                 <Image 
                   src="/assets/ImageAsset1.png" // Cần đảm bảo file này tồn tại trong public hoặc thay bằng link ảnh
                   alt="Shop Avatar"
                   width={100}
                   height={100}
                   className="object-cover"
                   onError={(e) => {
                     // Fallback xử lý lỗi ảnh nếu cần
                   }}
                 />
               </div>
            </div>

            <div className="flex flex-col justify-between h-full py-2">
              <div>
                <h1 className="font-sans text-[16px] font-medium text-black leading-[22px]">
                  abc shop
                </h1>
                <p className="font-sans text-[12px] font-light text-black leading-[22px] mt-1">
                  Online 4 phút trước
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button className="flex items-center justify-center gap-2 border border-[#E78720] rounded-full px-4 py-1 h-[28px] hover:bg-[#E78720]/5 transition-colors">
                  <span className="text-[#E78720] text-[14px] font-medium leading-none">
                    Theo dõi
                  </span>
                </button>
                <button className="flex items-center justify-center gap-2 border border-[#E78720] rounded-full px-4 py-1 h-[28px] hover:bg-[#E78720]/5 transition-colors">
                  <span className="text-[#E78720] text-[14px] font-medium leading-none">
                    Nhắn tin
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Columns */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-[100px]">
             {/* Column 1 */}
            <div className="flex flex-col gap-[20px]">
              {LEFT_STATS.map((stat, idx) => (
                <ShopStatItem key={idx} {...stat} />
              ))}
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-[20px]">
              {RIGHT_STATS.map((stat, idx) => (
                <ShopStatItem key={idx} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Area: Navigation Tabs */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex items-end gap-5 min-w-max border-b border-gray-100">
            {TABS_DATA.map((tab, idx) => (
              <ShopTabItem
                key={idx}
                label={tab.label}
                isActive={tab.isActive}
                isLargeText={tab.isLargeText}
                isOrangeText={tab.isOrangeText}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: VOUCHERS */}
      <div className="bg-white rounded-[20px] w-full p-8 flex flex-col gap-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-[20px] font-medium text-[#333333] capitalize leading-[24px]">
            Voucher
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-5">
          <ShopVoucherCard />
          <ShopVoucherCard />
          <ShopVoucherCard />
          <ShopVoucherCard />
        </div>
      </div>

    </div>
  );
};

export default ShopClient;