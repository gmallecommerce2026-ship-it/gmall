// src/modules/seller/orders/bulk-delivery/components/OrderFilterSection.tsx
'use client';

import React from 'react';
import classNames from 'classnames';

// --- Sub-components (Clean Code & Reusable) ---
const FilterChip = ({ label, count, isActive }: { label: string, count: number, isActive?: boolean }) => (
  <button className={classNames(
    "flex flex-col justify-center items-center px-6 py-2 rounded-[56px] border h-[58px] transition-all min-w-[160px]",
    isActive 
      ? "bg-white border-[#E78720] shadow-sm" 
      : "bg-white border-gray-200 hover:border-gray-300"
  )}>
    <span className={classNames("text-lg font-light", isActive ? "text-[#E78720]" : "text-gray-900")}>
      {label} {count > 0 && `(${count})`}
    </span>
  </button>
);

const StatCard = ({ label, count, isActive, className }: { label: string, count: number, isActive?: boolean, className?: string }) => (
  <div className={classNames(
    "flex flex-col justify-center items-center px-4 py-2 rounded-[56px] border h-[58px] transition-all min-w-[140px]",
    isActive 
      ? "bg-white border-[#E78720]" 
      : "bg-white border-gray-200",
    className
  )}>
    <span className={classNames("text-lg font-light whitespace-nowrap", isActive ? "text-[#E78720]" : "text-gray-900")}>
      {label} {count > 0 && `(${count})`}
    </span>
  </div>
);

// --- Main Component ---
export const OrderFilterSection = () => {
  return (
    <div className="bg-white rounded-xl shadow-[0px_6px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col gap-8 w-full max-w-[1100px]">
        
        {/* 1. Loại đơn hàng */}
        <div className="flex items-center gap-6">
            <span className="min-w-[130px] text-lg font-light text-gray-600">Loại đơn hàng</span>
            <div className="flex gap-4">
              <FilterChip label="Đơn hàng thường" count={0} isActive={true} />
              <FilterChip label="Đơn hỏa tốc" count={0} isActive={false} />
            </div>
        </div>

        {/* 2. Hạn giao hàng (Horizontal Scrollable) */}
        <div className="flex items-center gap-6">
            <span className="min-w-[130px] text-lg font-light text-gray-600">Hạn giao hàng</span>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <StatCard label="Tất cả trạng thái" count={0} isActive={true} />
                <StatCard label="Quá hạn giao hàng" count={0} />
                <StatCard label="Trong vòng 24h" count={0} />
                <StatCard label="Trên 24h" count={0} />
            </div>
        </div>

        {/* 3. Đơn vị vận chuyển */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
                <span className="min-w-[130px] text-lg font-light text-gray-600">Đơn vị vận chuyển</span>
                <div className="flex flex-wrap gap-4">
                   <StatCard label="VNP - Hàng Cồng Kềnh" count={0} />
                   <StatCard label="GHN - Hàng Cồng Kềnh" count={0} />
                   <StatCard label="SPX - Hàng Cồng Kềnh" count={0} />
                </div>
            </div>
        </div>
    </div>
  );
};