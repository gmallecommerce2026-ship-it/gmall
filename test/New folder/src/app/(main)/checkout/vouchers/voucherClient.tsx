// Lovegifts-Frontend-1.0/app/(routes)/checkout/vouchers/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { voucherOptionsData } from "@/modules/gift-payment/data";

// Định nghĩa kiểu voucher
type VoucherType = 'SHIPPING' | 'DISCOUNT';

interface VoucherItemProps {
  id: string;
  type: VoucherType;
  title: string;
  description: string;
  expiry?: string;
  isSelected: boolean;
  onSelect: (id: string, type: VoucherType) => void;
}

// Component hiển thị từng Coupon (Style Ticket)
const VoucherItem = ({ 
  id,
  type,
  title, 
  description,
  expiry,
  isSelected, 
  onSelect 
}: VoucherItemProps) => {
  return (
    <div 
      onClick={() => onSelect(id, type)}
      className={`
        relative flex w-full h-[110px] rounded-lg overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-md mb-3
        ${isSelected ? 'ring-2 ring-brand-orange border-transparent' : 'border border-gray-200 bg-white'}
      `}
    >
      {/* Cột Trái: Logo / Branding */}
      <div className={`
        w-[110px] flex flex-col items-center justify-center gap-1 p-2 text-white relative transition-colors
        ${isSelected ? 'bg-brand-orange' : (type === 'SHIPPING' ? 'bg-green-600' : 'bg-gray-500')}
      `}>
        <span className="font-bold text-lg tracking-widest border-2 border-white px-2 py-1">LG</span>
        <span className="text-[10px] font-medium uppercase text-center opacity-90">
            {type === 'SHIPPING' ? 'FREESHIP' : 'DISCOUNT'}
        </span>
        
        {/* Đường răng cưa trang trí dọc */}
        <div className="absolute right-[-6px] top-0 bottom-0 w-3 flex flex-col justify-between items-center z-10">
           {Array.from({length: 12}).map((_,i) => (
             <div key={i} className="w-1.5 h-1.5 rounded-full bg-white mb-1"></div>
           ))}
        </div>
      </div>

      {/* Cột Phải: Thông tin chi tiết */}
      <div className="flex-1 bg-white p-3 flex flex-col justify-center relative pl-5">
        <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">{title}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mt-3">
           <span className="text-[10px] sm:text-xs text-brand-orange border border-brand-orange/30 bg-orange-50 px-2 py-0.5 rounded">
             {expiry || 'HSD: 31/12/2025'}
           </span>
           
           {/* Nút chọn/Checkbox */}
           <div className={`
             w-5 h-5 rounded-full border flex items-center justify-center transition-colors
             ${isSelected ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'}
           `}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default function VoucherPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backUrl = searchParams.get('backUrl') || '/payment';
  const originalDataParam = searchParams.get('data') || '';
  
  // Lấy danh sách ID đã chọn từ URL (phân tách bằng dấu phẩy)
  const currentIds = (searchParams.get('selected') || '').split(',').filter(Boolean);

  // State lưu danh sách các ID voucher đã chọn
  const [selectedIds, setSelectedIds] = useState<string[]>(currentIds);

  // Hàm xử lý logic chọn voucher
  const handleSelect = (id: string, type: VoucherType) => {
    setSelectedIds(prev => {
        const isCurrentlySelected = prev.includes(id);

        if (isCurrentlySelected) {
            // Nếu đang chọn -> Bỏ chọn
            return prev.filter(item => item !== id);
        } else {
            // Nếu chưa chọn:
            // 1. Lọc bỏ các voucher CÙNG LOẠI cũ (để đảm bảo chỉ chọn 1 cái mỗi loại)
            // Ví dụ: Nếu chọn Voucher Giảm giá mới, phải bỏ voucher Giảm giá cũ.
            // Nhưng GIỮ LẠI voucher loại Vận chuyển.
            
            // Ở đây ta cần biết ID nào thuộc loại nào.
            // Do demo đơn giản, ta quy ước ID bắt đầu bằng 'SHIP' là vận chuyển.
            
            const isShipping = type === 'SHIPPING';
            
            // Giữ lại các voucher KHÁC loại với cái đang chọn
            const remaining = prev.filter(existingId => {
                const isExistingShipping = existingId.startsWith('SHIP');
                // Nếu đang chọn SHIP -> Giữ lại DISCOUNT (những cái không phải SHIP)
                // Nếu đang chọn DISCOUNT -> Giữ lại SHIP (những cái là SHIP)
                return isShipping ? !isExistingShipping : isExistingShipping;
            });

            return [...remaining, id];
        }
    });
  };

  const handleConfirm = () => {
    const params = new URLSearchParams();
    if (originalDataParam) params.set('data', originalDataParam);
    
    // Gửi về danh sách ID đã join
    if (selectedIds.length > 0) {
        params.set('updated_voucher', selectedIds.join(','));
    } else {
        params.delete('updated_voucher');
    }

    // Bảo toàn các tham số khác
    const updatedBuyer = searchParams.get('updated_buyer');
    if (updatedBuyer) params.set('updated_buyer', updatedBuyer);
    
    router.push(`${backUrl}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl h-[85vh] flex flex-col mt-4 md:mt-10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-white z-10">
           <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
           </button>
           <h1 className="text-xl font-bold text-gray-900">Chọn LoveGifts Voucher</h1>
        </div>

        {/* Input nhập mã */}
        <div className="p-5 bg-gray-50 border-b border-gray-100">
           <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nhập mã voucher LoveGifts" 
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand-orange uppercase"
              />
              <button className="bg-gray-200 text-gray-500 font-medium px-6 py-2.5 rounded-lg text-sm cursor-not-allowed">
                Áp dụng
              </button>
           </div>
        </div>

        {/* Danh sách Voucher */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-100">
           
           {/* SECTION 1: VẬN CHUYỂN (Có thể chọn chung với giảm giá) */}
           <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Mã vận chuyển (Dùng chung)</p>
           <VoucherItem 
              id="SHIP_FREESHIP15" 
              type="SHIPPING"
              title="Miễn phí vận chuyển"
              description="Giảm tối đa 15k cho đơn từ 0đ"
              isSelected={selectedIds.includes('SHIP_FREESHIP15')} 
              onSelect={handleSelect} 
           />
           <VoucherItem 
              id="SHIP_FREESHIP30" 
              type="SHIPPING"
              title="Freeship Xtra"
              description="Giảm tối đa 30k cho đơn từ 99k"
              isSelected={selectedIds.includes('SHIP_FREESHIP30')} 
              onSelect={handleSelect} 
           />

           {/* SECTION 2: GIẢM GIÁ (Chỉ chọn 1) */}
           <p className="text-sm font-bold text-gray-500 mb-3 mt-6 uppercase tracking-wide">Mã giảm giá & Hoàn xu</p>
           {/* Map từ mock data và tạo ID riêng biệt */}
           {voucherOptionsData.map((voucher, idx) => {
              // Tạo ID duy nhất cho mỗi voucher giảm giá
              const uniqueId = `DISCOUNT_VOUCHER_${idx}`;
              return (
                <VoucherItem 
                    key={idx}
                    id={uniqueId}
                    type="DISCOUNT"
                    title={voucher.text}
                    description={`Đơn tối thiểu ${voucher.minWidth || '0đ'}`}
                    isSelected={selectedIds.includes(uniqueId)}
                    onSelect={handleSelect}
                />
              );
           })}
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-500">Đã chọn:</span>
                <span className="font-bold text-brand-orange">{selectedIds.length} Voucher</span>
            </div>
            <button 
                onClick={handleConfirm}
                className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl hover:bg-brand-orange-dark transition-all shadow-lg shadow-orange-200 active:scale-95"
            >
                Đồng ý
            </button>
        </div>

      </div>
    </div>
  );
}