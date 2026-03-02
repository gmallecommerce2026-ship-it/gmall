// src/modules/product-detail/components/SizeSelector.tsx
"use client";
import React from "react";

interface SizeOption {
  id: string;
  name: string;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string;
  onChange: (sizeId: string) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <span className="text-base font-medium text-gray-700 w-20 flex-shrink-0">
        Chọn Size
      </span>
      <div className="flex flex-wrap gap-3">
        {sizes.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-5 py-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors ${
              selectedSize === opt.id
                ? "bg-brand-orange text-white border-brand-orange"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;