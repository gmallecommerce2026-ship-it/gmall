// src/modules/product/components/ProductSortBar.tsx
"use client";

import React from "react";
import { useProductFilters } from "@/hooks/useProductFilters";

interface ProductSortBarProps {
  title?: string;
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới Nhất' },
  { id: 'sales', label: 'Bán Chạy' },
  { id: 'price_asc', label: 'Giá Thấp - Cao' },
  { id: 'price_desc', label: 'Giá Cao - Thấp' },
];

// R3-2 (wiki 0045): refactor sort UI — rời NavButton wrapper sang button native
// để: (a) active state rõ ràng (background brand-orange), (b) hover smooth,
// (c) typography đồng bộ system, (d) bỏ prop magic-number của NavButton.
const ProductSortBar: React.FC<ProductSortBarProps> = () => {
  const { filters, setSort } = useProductFilters();

  return (
    <div className="bg-white rounded-lg w-full p-4 mt-6 shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gray-500 text-sm font-medium mr-1">Sắp xếp theo:</span>
        {SORT_OPTIONS.map((option) => {
          const isActive = filters.sort === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSort(option.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                isActive
                  ? 'bg-brand-orange text-white border-brand-orange shadow-sm hover:bg-orange-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange hover:text-brand-orange'
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSortBar;