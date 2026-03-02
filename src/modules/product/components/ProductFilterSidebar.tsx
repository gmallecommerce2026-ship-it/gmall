// src/modules/product/components/ProductFilterSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useProductFilters } from "@/hooks/useProductFilters";
import { filterLocations, filterBrands } from "@/lib/mock-data"; // Vẫn dùng tạm danh sách mock để render option
import FilterCheckbox from "@/components/ui/FilterCheckbox";
import RatingFilter from "@/components/ui/RatingFilter"; // Cần sửa component này để nhận onClick
import Button from "@/components/ui/Button";

// Component con để render section
const FilterSection: React.FC<{ title: string; children: React.ReactNode; isOpen?: boolean }> = ({
  title,
  children,
}) => (
  <div className="flex flex-col gap-3 py-4 border-b border-gray-100 last:border-0">
    <h3 className="font-sans text-base font-semibold text-gray-800 uppercase">{title}</h3>
    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">{children}</div>
  </div>
);

const ProductFilterSidebar = () => {
  const { filters, toggleLocation, setPriceRange, setRating, clearAll } = useProductFilters();
  
  // State local cho input giá để tránh trigger URL liên tục khi gõ
  const [localPrice, setLocalPrice] = useState({ min: filters.minPrice, max: filters.maxPrice });

  useEffect(() => {
    setLocalPrice({ min: filters.minPrice, max: filters.maxPrice });
  }, [filters.minPrice, filters.maxPrice]);

  const handleApplyPrice = () => {
    setPriceRange(localPrice.min || '', localPrice.max || '');
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 sticky top-4">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="font-sans text-lg font-bold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 10.6667H9.5V9.33333H6.5V10.6667ZM2.5 5.33333V6.66667H13.5V5.33333H2.5ZM4.5 9.66667V8.33333H11.5V9.66667H4.5Z" fill="black"/></svg>
          BỘ LỌC TÌM KIẾM
        </h2>
      </div>

      {/* 1. Khoảng Giá (Quan trọng nhất) */}
      <div className="py-4 border-b border-gray-100">
        <h3 className="font-sans text-base font-semibold text-gray-800 mb-3">KHOẢNG GIÁ</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="₫ TỪ"
            value={localPrice.min}
            onChange={(e) => setLocalPrice({ ...localPrice, min: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-brand-orange"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="₫ ĐẾN"
            value={localPrice.max}
            onChange={(e) => setLocalPrice({ ...localPrice, max: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-brand-orange"
          />
        </div>
        <Button 
            variant="primary" 
            className="w-full py-1 text-sm bg-brand-orange hover:bg-orange-600 text-white font-medium uppercase"
            onClick={handleApplyPrice}
        >
          Áp dụng
        </Button>
      </div>

      {/* 2. Nơi Bán */}
      <FilterSection title="Nơi Bán">
        {filterLocations.map((item) => (
          <FilterCheckbox 
            key={item.id} 
            label={item.label}
            // [FIX] Bỏ item.value, chỉ dùng item.label (hoặc item.id tuỳ logic BE)
            checked={filters.locations.includes(item.label)} 
            onChange={() => toggleLocation(item.label)}
          />
        ))}
      </FilterSection>

      {/* 3. Đánh Giá (5 sao -> 1 sao) */}
      <div className="py-4 border-b border-gray-100">
        <h3 className="font-sans text-base font-semibold text-gray-800 mb-2">ĐÁNH GIÁ</h3>
        {/* Render manual stars để dễ control logic click */}
        {[5, 4, 3, 2, 1].map((star) => (
            <div 
                key={star} 
                className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 ${filters.rating === String(star) ? 'bg-orange-50' : ''}`}
                onClick={() => setRating(star)}
            >
                <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                        <i key={i} className={i < star ? "fas fa-star" : "far fa-star text-gray-300"}>★</i>
                    ))}
                </div>
                <span className="text-sm text-gray-600">{star !== 5 ? 'trở lên' : ''}</span>
            </div>
        ))}
      </div>

      {/* Nút Xoá Tất Cả */}
      <Button 
        variant="outline" 
        className="w-full mt-6 py-2 border-brand-orange text-brand-orange hover:bg-orange-50"
        onClick={clearAll}
      >
        XOÁ TẤT CẢ
      </Button>
    </div>
  );
};

export default ProductFilterSidebar;