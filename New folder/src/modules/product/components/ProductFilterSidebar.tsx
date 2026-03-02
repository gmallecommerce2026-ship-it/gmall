// src/modules/product/components/ProductFilterSidebar.tsx
"use client";

import React from "react";
import {
  filterLocations,
  filterCategories,
  filterShipping,
  filterBrands,
  filterRatings,
  filterServices,
} from "@/lib/mock-data";

import FilterCheckbox from "@/components/ui/FilterCheckbox";
import FilterPriceInput from "@/components/ui/FilterPriceInput";
import RatingFilter from "@/components/ui/RatingFilter";
import Button from "@/components/ui/Button";
import { useTracking } from "@/hooks/useTracking";
// Component con cho mỗi section của sidebar
const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex flex-col gap-4 pt-6">
    <h3 className="font-sans text-lg font-semibold text-gray-700">{title}</h3>
    <div className="flex flex-col gap-3">{children}</div>
    <button className="text-sm text-gray-500 hover:text-brand-orange text-left">
      Xem thêm
    </button>
  </div>
);

const ProductFilterSidebar = () => {
  const { track } = useTracking();

  const handleFilterChange = (filterType: string, value: string) => {
    track('filter_products', filterType, { value: value });
    // Logic lọc cũ...
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="font-sans text-xl font-bold text-brand-orange">
          BỘ LỌC
        </h2>
        {/* Thêm icon filter ở đây nếu muốn */}
      </div>

      <div className="flex flex-col divide-y divide-gray-200">
        {/* Nơi Bán */}
        <FilterSection title="Nơi Bán">
          {filterLocations.map((item) => (
            <FilterCheckbox key={item.id} label={item.label} />
          ))}
        </FilterSection>

        {/* Theo Danh Mục */}
        <FilterSection title="Theo Danh Mục">
          {filterCategories.map((item) => (
            <FilterCheckbox key={item.id} label={item.label} />
          ))}
        </FilterSection>

        {/* Vận Chuyển */}
        <FilterSection title="Phương Thức Vận Chuyển">
          {filterShipping.map((item) => (
            <FilterCheckbox key={item.id} label={item.label} />
          ))}
        </FilterSection>

        {/* Thương Hiệu */}
        <FilterSection title="Thương Hiệu">
          {filterBrands.map((item) => (
            <FilterCheckbox 
              key={item.id} 
              label={item.label} 
              onClick={() => handleFilterChange('brand', 'Adidas')}
              />
          ))}
        </FilterSection>

        {/* Khoảng Giá */}
        <div className="pt-6">
          <h3 className="font-sans text-xl font-bold text-brand-orange mb-4">
            KHOẢNG GIÁ
          </h3>
          <FilterPriceInput />
          <Button variant="primary" className="w-full mt-4">
            ÁP DỤNG
          </Button>
        </div>

        {/* Tình Trạng */}
        <FilterSection title="TÌNH TRẠNG">
          <FilterCheckbox label="Mới" />
          <FilterCheckbox label="Đã Sử dụng" />
        </FilterSection>

        {/* Đánh Giá */}
        <div className="pt-6 flex flex-col gap-4">
          <h3 className="font-sans text-xl font-bold text-brand-orange">
            ĐÁNH GIÁ TRÊN
          </h3>
          <RatingFilter />
        </div>

        {/* Dịch Vụ */}
        <FilterSection title="DỊCH VỤ & KHUYẾN MÃI">
          {filterServices.map((item) => (
            <FilterCheckbox key={item.id} label={item.label} />
          ))}
        </FilterSection>
      </div>

      {/* Nút Xoá */}
      <Button variant="primary" className="w-full mt-6">
        XOÁ TẤT CẢ
      </Button>
    </div>
  );
};

export default ProductFilterSidebar;