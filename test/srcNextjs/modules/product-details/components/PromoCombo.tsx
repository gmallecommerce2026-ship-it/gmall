// src/modules/product-details/components/PromoCombo.tsx
"use client"; // Cần thiết vì chúng ta sử dụng useRef và onClick

import React, { useRef } from "react";
import ArrowRightIcon from "@/icons/arrow-right.svg";
// Tôi sử dụng inline SVG cho nút điều hướng để đảm bảo bạn không bị lỗi thiếu icon
// Nếu bạn có icon ChevronLeft/Right trong hệ thống, hãy thay thế vào đây.

interface ComboProduct {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
}

interface PromoComboProps {
  products: ComboProduct[];
}

const PromoCombo: React.FC<PromoComboProps> = ({ products = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Kiểm tra an toàn
  if (!products || products.length === 0) return null;

  // Hàm xử lý cuộn
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Khoảng cách cuộn mỗi lần nhấn
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-4 relative group">
      {/* Nút điều hướng Trái (Chỉ hiện trên Desktop khi hover) */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white border border-gray-200 shadow-md rounded-full p-2 hidden group-hover:flex items-center justify-center text-gray-600 hover:text-brand-orange-dark hover:border-brand-orange-dark transition-all disabled:opacity-50"
        aria-label="Scroll Left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Container chứa Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Ẩn scrollbar mặc định
      >
        {products.map((product) => (
          <div
            key={product.id}
            // min-w-[300px]: Đặt chiều rộng cố định để các item dàn hàng ngang
            // snap-center: Căn giữa item khi dừng cuộn
            className="min-w-[280px] sm:min-w-[320px] flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer snap-center bg-white"
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-black line-clamp-2 mb-1">
                {product.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-brand-orange-dark">
                  {product.price}
                </span>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút điều hướng Phải */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white border border-gray-200 shadow-md rounded-full p-2 hidden group-hover:flex items-center justify-center text-gray-600 hover:text-brand-orange-dark hover:border-brand-orange-dark transition-all"
        aria-label="Scroll Right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default PromoCombo;