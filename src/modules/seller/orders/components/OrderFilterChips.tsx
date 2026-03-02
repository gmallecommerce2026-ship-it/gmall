// src/modules/seller/orders/components/OrderFilterChips.tsx
import React from 'react';
import classNames from 'classnames';

interface FilterChipProps {
  label: string;
  title?: string; // "Ưu tiên" hoặc "Hành động quan trọng"
  items: { id: string; label: string; isActive?: boolean }[];
  onSelect: (id: string) => void;
}

export const OrderFilterGroup: React.FC<FilterChipProps> = ({ label, items, onSelect }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-500 font-light whitespace-nowrap min-w-[120px] text-sm md:text-base">
        {label}
      </span>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={classNames(
              "px-4 py-2 rounded-[56px] border text-sm transition-all whitespace-nowrap min-w-[140px] h-[48px] flex items-center justify-center",
              item.isActive
                ? "border-[#E78720] text-[#E78720] bg-white font-medium shadow-sm"
                : "border-gray-200 text-gray-700 bg-white font-light hover:border-[#E78720]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};