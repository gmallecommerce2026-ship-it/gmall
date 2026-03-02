// src/modules/product-detail/components/QuantitySelector.tsx
"use client";
import React from "react";
import PlusIcon from "@/icons/plus.svg";

// Icon dấu trừ (vì trong file icons.tsx không có)
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
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
}) => {
  const increment = () => onChange(quantity + 1);
  const decrement = () => onChange(Math.max(1, quantity - 1)); // Không cho phép nhỏ hơn 1

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
        className="w-8 h-8 flex items-center justify-center text-gray-700 rounded-full hover:bg-gray-200"
        aria-label="Tăng số lượng"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;