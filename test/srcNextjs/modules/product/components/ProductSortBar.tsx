// src/modules/product/components/ProductSortBar.tsx
"use client";

import React from "react";
import NavButton from "@/components/ui/NavButton";
import { useProductFilters } from "@/hooks/useProductFilters";

interface ProductSortBarProps {
  title: string;
}

// Định nghĩa map mapping từ ID sang Label và API Value
const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới Nhất' },       // Đã khớp yêu cầu
  { id: 'sales', label: 'Bán Chạy' },        // Đã khớp yêu cầu
  { id: 'price_asc', label: 'Giá Thấp - Cao' }, // Đã khớp yêu cầu
  { id: 'price_desc', label: 'Giá Cao - Thấp' },// Đã khớp yêu cầu
];

const ProductSortBar: React.FC<ProductSortBarProps> = ({ title }) => {
  const { filters, setSort } = useProductFilters();

  return (
    <div className="bg-white rounded-lg w-full p-6 mt-8 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-500 text-sm font-medium mr-2">Sắp xếp theo:</span>
          {SORT_OPTIONS.map((option) => {
            const isActive = filters.sort === option.id;
            return (
              <NavButton
                key={option.id}
                prop32={option.label}
                // Shopee style: Active màu cam, Inactive màu trắng/xám
                prop14={isActive ? "#ee4d2d" : "#fff"} 
                prop29={!isActive} // true = text gray, false = text white
                className={`border ${isActive ? 'border-brand-orange' : 'border-gray-200 hover:bg-gray-50'}`}
                style={{
                    color: isActive ? '#fff' : '#555',
                    fontWeight: isActive ? 600 : 400
                }}
                onClick={() => setSort(option.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductSortBar;