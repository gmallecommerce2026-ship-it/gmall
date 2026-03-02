// src/components/cart/VoucherSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { VoucherService, Voucher } from '@/services/voucher.service';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { toast } from 'react-hot-toast';
import CloseIcon from '@/icons/close.svg'; // Icon đóng
import TicketIcon from '@/icons/list.svg';  // Icon voucher

interface Props {
  cartTotal: number;
}

export default function VoucherSelector({ cartTotal }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local state cho danh sách voucher
  const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]);
  const [systemVouchers, setSystemVouchers] = useState<Voucher[]>([]);

  // Store
  const { 
    selectedShopVoucher, 
    selectedSystemVoucher, 
    setShopVoucher, 
    setSystemVoucher 
  } = useCheckoutStore();

  // Fetch vouchers khi mở modal
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        VoucherService.getMyVouchers(), // Giả sử hàm này trả về voucher user đã lưu
        // Nếu API backend chưa tách, bạn có thể fetch all rồi filter ở client
      ]).then(([myVouchers]) => {
         // Phân loại voucher
         const shop = myVouchers.filter(v => v.scope === 'SHOP' || v.scope === 'PRODUCT');
         const system = myVouchers.filter(v => v.scope === 'GLOBAL');
         
         setShopVouchers(shop);
         setSystemVouchers(system);
      }).catch(() => {
        toast.error('Không tải được danh sách voucher');
      }).finally(() => setLoading(false));
    }
  }, [isOpen]);

  const TicketItem = ({ voucher, isSelected, onSelect }: { voucher: Voucher, isSelected: boolean, onSelect: () => void }) => {
    const isEligible = cartTotal >= voucher.minOrderValue;
    const progress = Math.min(100, (cartTotal / voucher.minOrderValue) * 100);

    return (
      <div 
        onClick={() => isEligible && onSelect()}
        className={`relative flex mb-3 bg-white border rounded-lg overflow-hidden transition-all cursor-pointer
          ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
          ${!isEligible ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-sm'}
        `}
      >
        {/* Left Side - Image/Icon */}
        <div className={`w-24 flex flex-col items-center justify-center p-2 border-r border-dashed border-gray-200 
          ${isSelected ? 'bg-orange-100' : 'bg-gray-100'}`}>
          <span className="text-xs font-bold text-orange-600">G-MALL</span>
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mt-1 text-xs">
            {voucher.type === 'PERCENTAGE' ? '%' : 'VNĐ'}
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-gray-800 line-clamp-1">
              Giảm {voucher.type === 'PERCENTAGE' ? `${voucher.amount}%` : `${(voucher.amount/1000).toFixed(0)}k`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Đơn tối thiểu {(voucher.minOrderValue/1000).toFixed(0)}k
            </div>
          </div>
          
          {/* Progress bar nếu chưa đủ điều kiện */}
          {!isEligible && (
            <div className="mt-2">
              <div className="text-[10px] text-red-500 mb-1">Mua thêm để dùng</div>
              <div className="h-1 w-full bg-gray-200 rounded-full">
                <div style={{ width: `${progress}%` }} className="h-full bg-orange-400 rounded-full"></div>
              </div>
            </div>
          )}
          
          <div className="text-[10px] text-gray-400 mt-2">HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</div>
        </div>

        {/* Checkbox Circle (Shopee style) */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
           <div className={`w-5 h-5 rounded-full border flex items-center justify-center
             ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}
           `}>
             {isSelected && <span className="text-white text-xs">✓</span>}
           </div>
        </div>
      </div>
    );
  };

  const totalDiscountPreview = (selectedShopVoucher ? 1 : 0) + (selectedSystemVoucher ? 1 : 0);

  return (
    <>
      {/* 1. Thanh kích hoạt (Trigger Bar) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TicketIcon className="w-6 h-6 text-orange-500" />
          <span className="text-gray-700 font-medium">G-Mall Voucher</span>
        </div>
        <div className="flex items-center gap-2">
          {totalDiscountPreview > 0 ? (
            <span className="text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded border border-orange-100">
              Đã chọn {totalDiscountPreview} mã
            </span>
          ) : (
            <span className="text-gray-400 text-sm">Chọn hoặc nhập mã</span>
          )}
          <span className="text-gray-400 text-lg">›</span>
        </div>
      </div>

      {/* 2. Popup Bottom Sheet / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg h-[85vh] sm:h-[600px] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-center p-4 border-b relative">
              <h3 className="font-bold text-lg text-gray-800">Chọn G-Mall Voucher</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Input Search Voucher (Optional) */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập mã voucher" 
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-orange-500"
                />
                <button className="px-4 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-300 disabled:opacity-50">
                  Áp dụng
                </button>
              </div>
            </div>

            {/* List Vouchers - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-6">
              {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải mã giảm giá...</div>
              ) : (
                <>
                  {/* Section 1: Platform Vouchers */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Voucher từ Sàn G-Mall</h4>
                    {systemVouchers.length > 0 ? (
                      systemVouchers.map(v => (
                        <TicketItem 
                          key={v.id} 
                          voucher={v} 
                          isSelected={selectedSystemVoucher?.id === v.id}
                          onSelect={() => setSystemVoucher(selectedSystemVoucher?.id === v.id ? null : v)} // Toggle logic
                        />
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 text-center py-2">Không có voucher sàn</div>
                    )}
                  </div>

                  {/* Section 2: Shop Vouchers */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Voucher từ Shop</h4>
                    {shopVouchers.length > 0 ? (
                      shopVouchers.map(v => (
                        <TicketItem 
                          key={v.id} 
                          voucher={v} 
                          isSelected={selectedShopVoucher?.id === v.id}
                          onSelect={() => setShopVoucher(selectedShopVoucher?.id === v.id ? null : v)} // Toggle logic
                        />
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 text-center py-2">Không có voucher từ shop</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-white safe-area-bottom">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all"
              >
                Đồng ý
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}