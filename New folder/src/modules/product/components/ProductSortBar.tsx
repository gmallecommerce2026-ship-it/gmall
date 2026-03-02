// src/modules/product/components/ProductSortBar.tsx
"use client";

import React, { useState } from "react";
import NavButton from "@/components/ui/NavButton"; // Tái sử dụng NavButton
import { productSortChips } from "@/lib/mock-data";

interface ProductSortBarProps {
  title: string;
}

const ProductSortBar: React.FC<ProductSortBarProps> = ({ title }) => {
  const [activeChip, setActiveChip] = useState("all");

  return (
    <div className="bg-white rounded-lg w-full p-6 mt-8">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <h2 className="font-sans text-4xl font-bold text-brand-dark-green tracking-wide">
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {productSortChips.map((chip) => (
            <NavButton
              key={chip.id}
              prop32={chip.label}
              // Logic để set active
              prop14={
                activeChip === chip.id
                  ? "rgba(231,135,32,1)" // Active color
                  : "rgba(255,255,255,1)" // Inactive color
              }
              prop29={activeChip !== chip.id} // isTextGray
              // Thêm onClick để cập nhật state
              onClick={() => setActiveChip(chip.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSortBar;