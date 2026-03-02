"use client";
import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface ShopFilterSidebarProps {
  categories: any[];
  onFilterChange: (filters: any) => void;
  selectedCategoryId?: string | null;
}

const ShopFilterSidebar = ({ categories, onFilterChange, selectedCategoryId }: ShopFilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  // [FIX] Bỏ state 'selectedCategory' thừa đi, dùng trực tiếp props 'selectedCategoryId'
  // const [selectedCategory, setSelectedCategory] = useState<string | null>(null); 

  const handleApply = () => {
    onFilterChange({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      categoryId: selectedCategoryId, // Dùng props
    });
  };

  const handleReset = () => {
    setPriceRange({ min: '', max: '' });
    onFilterChange({}); // Reset filter sẽ làm cha set selectedCategoryId về null
  };

  return (
    <div className="w-64 flex-shrink-0 space-y-6 bg-white p-4 rounded-lg border border-gray-100 h-fit sticky top-24">
      <div className="flex items-center gap-2 font-bold text-gray-800 border-b pb-2">
        <span>Bộ lọc tìm kiếm</span>
      </div>

      {/* Danh mục */}
      <div>
        <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Danh mục Shop</h4>
        <ul className="space-y-2 text-sm max-h-60 overflow-y-auto custom-scrollbar">
          <li 
            // [FIX] So sánh với selectedCategoryId từ props
            className={`cursor-pointer hover:text-brand-orange transition-colors ${!selectedCategoryId ? 'text-brand-orange font-bold' : 'text-gray-600'}`}
            onClick={() => onFilterChange({ shopCategoryId: null })}
          >
            Tất cả sản phẩm
          </li>
          {categories.map((cat) => (
            <li 
              key={cat.id}
              // [FIX] So sánh với selectedCategoryId từ props
              className={`cursor-pointer hover:text-brand-orange transition-colors ${selectedCategoryId === cat.id ? 'text-brand-orange font-bold' : 'text-gray-600'}`}
              onClick={() => onFilterChange({ shopCategoryId: cat.id })}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Khoảng giá */}
      <div>
        <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Khoảng giá</h4>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" 
            placeholder="₫ TỪ" 
            className="w-full px-2 py-1 text-sm border rounded outline-none focus:border-brand-orange"
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="₫ ĐẾN" 
            className="w-full px-2 py-1 text-sm border rounded outline-none focus:border-brand-orange"
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
          />
        </div>
        <Button onClick={handleApply} className="w-full text-sm py-2">Áp dụng</Button>
        <button onClick={handleReset} className="w-full mt-2 text-sm text-gray-500 hover:text-brand-orange">Xóa tất cả</button>
      </div>
    </div>
  );
};

export default ShopFilterSidebar; // [QUAN TRỌNG] Dùng default export