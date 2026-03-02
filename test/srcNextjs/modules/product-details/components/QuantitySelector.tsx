// src/modules/product-details/components/QuantitySelector.tsx
"use client";
import React from "react";
import PlusIcon from "@/icons/plus.svg";

const MinusIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  max?: number; // [FIX] Thêm tham số max (optional)
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
  max, // [FIX]
}) => {
  
  const increment = () => {
    // [FIX] Kiểm tra tồn kho trước khi tăng
    if (max !== undefined && quantity >= max) return;
    onChange(quantity + 1);
  };

  const decrement = () => onChange(Math.max(1, quantity - 1));

  return (
    <div className="flex items-center gap-4 bg-gray-100 rounded-full h-12 px-2.5">
      <button
        onClick={decrement}
        className="w-8 h-8 flex items-center justify-center text-gray-700 rounded-full hover:bg-gray-200"
        aria-label="Giảm số lượng"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <span className="text-base font-medium text-black w-6 text-center">
        {quantity}
      </span>
      <button
        onClick={increment}
        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 ${
           max !== undefined && quantity >= max ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
        }`}
        aria-label="Tăng số lượng"
        disabled={max !== undefined && quantity >= max}
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;