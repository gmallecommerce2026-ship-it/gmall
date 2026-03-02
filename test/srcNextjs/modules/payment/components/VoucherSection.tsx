// src/modules/payment/components/VoucherSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { VoucherService, Voucher } from '@/services/voucher.service';
import { toast } from 'react-hot-toast';

// --- PROPS ---
interface VoucherSectionProps {
  cartTotal: number;
  useCoins: boolean;
  onToggleCoins: (val: boolean) => void;
  coinBalance?: number;    
  coinDiscount?: number;
  
  // [FIX] Thêm props này để khớp với PaymentPage
  selectedVoucherId?: string | null; 
  onApplyVoucher?: (voucher: Voucher | null) => void;
}

// --- ICONS ---
const TicketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10.5C21 9.67157 21.6716 9 22.5 9V6C22.5 4.89543 21.6046 4 20.5 4H3.5C2.39543 4 1.5 4.89543 1.5 6V9C2.32843 9 3 9.67157 3 10.5C3 11.3284 2.32843 12 1.5 12V15C1.5 16.1046 2.39543 17 3.5 17H20.5C21.6046 17 22.5 16.1046 22.5 15V12C21.6716 12 21 11.3284 21 10.5Z" stroke="#E78720" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 4V17" stroke="#E78720" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3"/>
    <circle cx="14.5" cy="10.5" r="2.5" stroke="#E78720" strokeWidth="1.5"/>
  </svg>
);

const CoinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#EAB308" strokeWidth="1.5"/>
    <path d="M12 16V8" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 8H12.5C13.8807 8 15 9.11929 15 10.5C15 11.8807 13.8807 13 12.5 13H11.5C10.1193 13 9 14.1193 9 15.5C9 16.8807 10.1193 18 11.5 18H14" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- SUB COMPONENTS ---
const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (val: boolean) => void; disabled?: boolean }> =
  ({ enabled, setEnabled, disabled }) => (
    <button
      onClick={(e) => { e.stopPropagation(); !disabled && setEnabled(!enabled); }}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 ${
        enabled ? 'bg-brand-orange' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

// --- MAIN COMPONENT ---
const VoucherSection: React.FC<VoucherSectionProps> = ({
  cartTotal,
  useCoins,
  onToggleCoins,
  coinBalance = 0,
  coinDiscount = 0,
  selectedVoucherId, // [NEW] Nhận props nhưng chủ yếu dùng store để quản lý 2 voucher
  onApplyVoucher     // [NEW] Callback gọi khi user confirm
}) => {
  // 1. Store & State
  const { 
    selectedShopVoucher, 
    selectedSystemVoucher, 
    setShopVoucher, 
    setSystemVoucher 
  } = useCheckoutStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<{ shop: Voucher[], system: Voucher[] }>({ shop: [], system: [] });

  // 2. Tính toán hiển thị (Display Logic)
  const calcDiscountValue = (voucher: Voucher | null, total: number) => {
    if (!voucher || total < voucher.minOrderValue) return 0;
    if (voucher.type === 'FIXED_AMOUNT') return voucher.amount;
    const val = (total * voucher.amount) / 100;
    return voucher.maxDiscount ? Math.min(val, voucher.maxDiscount) : val;
  };

  const shopDiscount = calcDiscountValue(selectedShopVoucher, cartTotal);
  const systemDiscount = calcDiscountValue(selectedSystemVoucher, cartTotal - shopDiscount);
  const totalDiscountAmount = shopDiscount + systemDiscount;
  
  const selectedCount = (selectedShopVoucher ? 1 : 0) + (selectedSystemVoucher ? 1 : 0);
  
  const displayLabel = selectedCount > 0 
    ? `Đã chọn ${selectedCount} mã`
    : "Chọn hoặc nhập mã";

  const canUseCoins = coinBalance > 0;

  // 3. Fetch Vouchers khi mở Modal
  useEffect(() => {
    if (isModalOpen) {
      setLoading(true);
      VoucherService.getMyVouchers()
        .then((data) => {
          const shop = data.filter(v => ['SHOP', 'PRODUCT'].includes(v.scope));
          const system = data.filter(v => v.scope === 'GLOBAL');
          setVouchers({ shop, system });
        })
        .catch(() => toast.error("Lỗi tải voucher"))
        .finally(() => setLoading(false));
    }
  }, [isModalOpen]);

  // 4. Xử lý khi nhấn "Đồng ý"
  const handleConfirm = () => {
      setIsModalOpen(false);
      
      // Nếu có callback từ cha, gọi nó để update API Preview
      // Ưu tiên gửi System voucher hoặc Shop voucher (vì PaymentPage đang chỉ nhận 1 ID)
      // Lưu ý: Store (useCheckoutStore) đã lưu cả 2, nên UI vẫn hiển thị đúng.
      // Dòng này giúp PaymentPage trigger API tính lại tiền.
      if (onApplyVoucher) {
          // Gửi voucher có giá trị giảm lớn hơn hoặc ưu tiên System
          // Hoặc gửi null nếu không chọn gì
          const primaryVoucher = selectedSystemVoucher || selectedShopVoucher || null;
          onApplyVoucher(primaryVoucher);
      }
  };

  // 5. Component con: Voucher Item Row
  const VoucherRow = ({ voucher, isSelected, onSelect }: { voucher: Voucher, isSelected: boolean, onSelect: () => void }) => {
    const isEligible = cartTotal >= voucher.minOrderValue;
    const percent = Math.min(100, (cartTotal / voucher.minOrderValue) * 100);

    return (
      <div 
        onClick={() => isEligible && onSelect()}
        className={`group relative flex items-stretch bg-white border rounded-lg overflow-hidden transition-all mb-3 select-none
          ${isSelected ? 'border-brand-orange bg-orange-50/30' : 'border-gray-200'}
          ${!isEligible ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer hover:border-orange-200 hover:shadow-sm'}
        `}
      >
        <div className={`w-24 flex flex-col items-center justify-center p-2 border-r border-dashed 
          ${isSelected ? 'border-brand-orange bg-orange-100/20' : 'border-gray-200 bg-gray-50'}`}>
           <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-xs shadow-sm">
             {voucher.type === 'PERCENTAGE' ? '%' : 'VNĐ'}
           </div>
           <span className="text-[10px] font-bold text-brand-orange mt-1 uppercase tracking-wider">G-MALL</span>
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between relative">
          <div>
            <div className="text-sm font-bold text-gray-800 line-clamp-1">
               {voucher.type === 'PERCENTAGE' ? `Giảm ${voucher.amount}%` : `Giảm ${(voucher.amount/1000).toLocaleString('vi-VN')}k`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
               Đơn tối thiểu {(voucher.minOrderValue/1000).toLocaleString('vi-VN')}k
            </div>
            {voucher.maxDiscount && (
               <div className="text-[10px] text-gray-400">Giảm tối đa {(voucher.maxDiscount/1000).toLocaleString('vi-VN')}k</div>
            )}
          </div>
          
          {!isEligible && (
             <div className="mt-2 w-full">
                <div className="text-[10px] text-red-500 mb-0.5">Mua thêm để dùng</div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div style={{ width: `${percent}%` }} className="h-full bg-brand-orange rounded-full"></div>
                </div>
             </div>
          )}

          <div className="text-[10px] text-gray-400 mt-2">HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</div>
          
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
             <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center
                ${isSelected ? 'bg-brand-orange border-brand-orange' : 'border-gray-300 bg-white group-hover:border-gray-400'}
             `}>
                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* 1. Phần chọn Voucher */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="flex justify-between items-center p-5 cursor-pointer hover:bg-orange-50/30 transition-colors group border-b border-dashed border-gray-200"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <TicketIcon />
             </div>
             <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-base group-hover:text-brand-orange transition-colors">G-Mall Voucher</span>
                <span className={`text-sm ${selectedCount > 0 ? 'text-brand-orange font-medium' : 'text-gray-400'}`}>
                  {displayLabel}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2">
             {totalDiscountAmount > 0 && (
               <span className="hidden sm:block bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-pulse">
                 -{totalDiscountAmount.toLocaleString('vi-VN')}đ
               </span>
             )}
             <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors" />
          </div>
        </div>

        {/* 2. Phần dùng Xu */}
        <div className={`flex justify-between items-center p-5 ${canUseCoins ? 'bg-gray-50/50' : 'bg-gray-100 opacity-70'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center">
               <CoinIcon />
            </div>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-base">Dùng G-Mall Xu</span>
                  {!canUseCoins && <span className="text-xs text-red-500 font-medium">(Số dư không đủ)</span>}
               </div>
               
               <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">
                     Số dư: <span className="font-medium text-black">{coinBalance.toLocaleString('vi-VN')}</span>
                  </span>
                  
                  {useCoins && coinDiscount > 0 && (
                    <span className="text-brand-orange font-bold text-xs bg-orange-100 px-1.5 py-0.5 rounded ml-1">
                      -{coinDiscount.toLocaleString('vi-VN')}đ
                    </span>
                  )}
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className={`text-sm font-medium transition-colors ${useCoins ? 'text-brand-orange' : 'text-gray-400'}`}>
               {useCoins ? `-${coinDiscount.toLocaleString('vi-VN')}đ` : 'Tắt'}
             </span>
             <ToggleSwitch 
                 enabled={useCoins} 
                 setEnabled={onToggleCoins} 
                 disabled={!canUseCoins}
             />
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => setIsModalOpen(false)}
           ></div>

           <div className="relative bg-white w-full sm:max-w-lg h-[85vh] sm:h-[650px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
              
              <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl z-10">
                <h3 className="font-bold text-lg text-gray-800">Chọn G-Mall Voucher</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Đang tải mã ưu đãi...</span>
                  </div>
                ) : (
                  <>
                    <div>
                       <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 pl-1 flex items-center gap-2">
                         <span>Voucher Sàn G-Mall</span>
                         <span className="bg-orange-100 text-brand-orange px-1.5 rounded text-[10px]">Được dùng chung</span>
                       </h4>
                       {vouchers.system.length > 0 ? (
                         vouchers.system.map(v => (
                           <VoucherRow 
                              key={v.id} 
                              voucher={v} 
                              isSelected={selectedSystemVoucher?.id === v.id}
                              onSelect={() => setSystemVoucher(selectedSystemVoucher?.id === v.id ? null : v)}
                           />
                         ))
                       ) : (
                         <div className="text-center py-4 text-gray-400 text-sm bg-white rounded-lg border border-dashed">Chưa có mã sàn nào</div>
                       )}
                    </div>

                    <div>
                       <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 pl-1">Voucher Shop</h4>
                       {vouchers.shop.length > 0 ? (
                         vouchers.shop.map(v => (
                           <VoucherRow 
                              key={v.id} 
                              voucher={v} 
                              isSelected={selectedShopVoucher?.id === v.id}
                              onSelect={() => setShopVoucher(selectedShopVoucher?.id === v.id ? null : v)}
                           />
                         ))
                       ) : (
                         <div className="text-center py-4 text-gray-400 text-sm bg-white rounded-lg border border-dashed">Shop chưa có mã giảm giá</div>
                       )}
                    </div>
                  </>
                )}
                <div className="h-20"></div>
              </div>

              <div className="p-4 border-t bg-white safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)] rounded-b-2xl z-10">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Đã chọn: <strong className="text-brand-orange">{selectedCount}</strong> mã</span>
                    <span className="text-sm text-gray-500">Tiết kiệm: <strong className="text-brand-orange">{totalDiscountAmount.toLocaleString('vi-VN')}đ</strong></span>
                 </div>
                 <button 
                   onClick={handleConfirm}
                   className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] transition-all"
                 >
                   Đồng ý
                 </button>
              </div>

           </div>
        </div>
      )}
    </>
  );
};

export default VoucherSection;