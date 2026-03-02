// src/modules/cart/components/CheckoutSummary.tsx
'use client';
import React from 'react';
import { useCartData } from '@/store/useCartStore'; // Import từ store mới sửa

interface CheckoutSummaryProps {
  onBuyNow: () => void;
  onGiftNow: () => void;
}

// Component con hiển thị dòng (Giống PaymentSummary)
const SummaryRow = ({ 
  label, 
  value, 
  color = "text-gray-600", 
  isBold = false, 
  isNegative = false 
}: { label: string; value: number; color?: string; isBold?: boolean; isNegative?: boolean }) => {
  if (value === 0 && isNegative) return null;
  return (
    <div className="flex justify-between items-center w-full py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} ${color}`}>
        {isNegative && value > 0 ? '-' : ''}{value.toLocaleString('vi-VN')} đ
      </span>
    </div>
  );
};

export default function CheckoutSummary({ onBuyNow, onGiftNow }: CheckoutSummaryProps) {
  const { totalSelectedPrice, selectedIds } = useCartData();
  const selectedCount = selectedIds.length;

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-nunito text-base font-bold text-black mb-3 pb-3 border-b border-gray-100">
          Thông tin đơn hàng
        </h3>

        <SummaryRow 
            label={`Tạm tính (${selectedCount} sản phẩm)`} 
            value={totalSelectedPrice} 
            color="text-gray-800"
        />
        
        {/* Có thể thêm dòng Giảm giá ước tính nếu có logic tính trước */}
        
        <div className="w-full h-px bg-gray-100 my-3" />

        <div className="flex justify-between items-center w-full">
          <span className="text-base font-bold text-gray-800">Tổng cộng</span>
          <div className="text-right">
             <span className="text-xl font-bold text-orange-600 font-poppins block">
                {totalSelectedPrice.toLocaleString('vi-VN')} đ
             </span>
             <span className="text-[10px] text-gray-400 font-normal">
                (Đã bao gồm VAT)
             </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button 
            onClick={onBuyNow}
            disabled={selectedCount === 0}
            className={`w-full font-outfit text-lg font-bold h-[50px] rounded-lg transition-all shadow-md flex items-center justify-center
                ${selectedCount === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg active:scale-[0.98]'
                }`}
        >
            MUA NGAY ({selectedCount})
        </button>
        
        <button 
            onClick={onGiftNow}
            disabled={selectedCount === 0}
            className={`w-full font-outfit text-base font-bold h-[45px] rounded-lg border border-dashed flex items-center justify-center gap-2 transition-all
                ${selectedCount === 0
                    ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'border-pink-500 text-pink-500 bg-pink-50 hover:bg-pink-100 active:scale-[0.98]'
                }`}
        >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 2.322 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
             </svg>
            TẶNG QUÀ NGAY
        </button>
      </div>
    </div>
  );
}