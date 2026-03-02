// src/modules/product-detail/components/ColorSelector.tsx
"use client";
import React from "react";

interface ColorOption {
  id: string;
  color: string;
  name: string;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string;
  onChange: (colorId: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <span className="text-base font-medium text-gray-700 w-20 flex-shrink-0">
        Chọn màu
      </span>
      <div className="flex flex-wrap gap-3">
        {colors.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2.5 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
              selectedColor === opt.id
                ? "border-brand-orange"
                : "border-gray-300 hover:border-gray-500"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: opt.color }}
            ></span>
            <span className="text-sm text-gray-800">{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;