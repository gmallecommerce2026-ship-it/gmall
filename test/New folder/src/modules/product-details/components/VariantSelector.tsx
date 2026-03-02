// File: src/modules/product-details/components/VariantSelector.tsx
import React from "react";
import clsx from "clsx";
import { ProductTier } from "@/types/product";

interface VariantSelectorProps {
  tier: ProductTier;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  tier,
  selectedIndex,
  onSelect,
}) => {
  // 1. Kiểm tra dữ liệu: Nếu không có options thì không render
  if (!tier.options || tier.options.length === 0) return null;

  // 2. Xác định xem nhóm này có dùng hình ảnh không
  // (Kiểm tra xem mảng images có tồn tại và có ít nhất 1 ảnh hợp lệ không)
  const useImage = tier.images && tier.images.length > 0 && tier.images.some(img => img && img !== "");

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Tiêu đề nhóm (Màu sắc, Size...) */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-900 capitalize">
          {tier.name}: 
          <span className="ml-2 font-normal text-gray-500">
            {selectedIndex !== -1 ? tier.options[selectedIndex] : "Vui lòng chọn"}
          </span>
        </label>
      </div>
      
      {/* Danh sách Options */}
      <div className="flex flex-wrap gap-3">
        {tier.options.map((optionName, idx) => {
          const isSelected = selectedIndex === idx;
          const hasImage = useImage && tier.images?.[idx];

          return (
            <button
              key={`${tier.name}-${idx}`}
              onClick={() => onSelect(idx)}
              type="button"
              className={clsx(
                "relative group transition-all duration-200 focus:outline-none",
                // Style chung cho viền và bo góc
                "border rounded-lg overflow-hidden",
                
                // --- TRƯỜNG HỢP 1: CÓ HÌNH ẢNH (Màu sắc) ---
                hasImage 
                  ? [
                      "p-1 h-16 min-w-[4rem] flex flex-col items-center justify-center gap-1", // Layout
                      isSelected 
                        ? "border-brand-orange bg-orange-50 ring-1 ring-brand-orange" 
                        : "border-gray-200 bg-white hover:border-gray-400"
                    ]
                  
                // --- TRƯỜNG HỢP 2: CHỈ CÓ CHỮ (Size) ---
                  : [
                      "px-4 py-2 min-w-[3rem] text-sm font-medium", // Layout
                      isSelected
                        ? "bg-brand-orange text-white border-brand-orange shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    ]
              )}
            >
              {/* Nội dung bên trong nút */}
              {hasImage ? (
                // Layout cho Màu sắc (Ảnh + Tên nhỏ bên dưới nếu cần, hoặc chỉ ảnh)
                <>
                  <div className="relative w-full h-full aspect-square rounded-md overflow-hidden bg-gray-100">
                    <img 
                      src={tier.images![idx]} 
                      alt={optionName} 
                      className="w-full h-full object-cover object-center" 
                    />
                    {/* Overlay khi active */}
                    {isSelected && <div className="absolute inset-0 bg-brand-orange/10" />}
                  </div>
                  {/* Nếu muốn hiện tên màu bên dưới ảnh thì bỏ comment dòng này */}
                  {/* <span className="text-[10px] truncate max-w-full text-gray-600">{optionName}</span> */}
                </>
              ) : (
                // Layout cho Size (Chỉ chữ)
                <span>{optionName}</span>
              )}

              {/* Icon check góc trên bên phải cho trường hợp có ảnh */}
              {hasImage && isSelected && (
                 <div className="absolute top-0 right-0 bg-brand-orange text-white w-4 h-4 rounded-bl-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                 </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSelector;