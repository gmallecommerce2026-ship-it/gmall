"use client";

import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface VoucherSectionProps {
  onSelectVoucher: () => void;
  selectedVoucherText?: string;
  discountAmount?: number; // Đổi sang number để dễ check > 0
  useCoins: boolean;
  onToggleCoins: (val: boolean) => void;
  coinBalance?: number;
}

// Icon Voucher (Dạng vé)
const TicketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10.5C21 9.67157 21.6716 9 22.5 9V6C22.5 4.89543 21.6046 4 20.5 4H3.5C2.39543 4 1.5 4.89543 1.5 6V9C2.32843 9 3 9.67157 3 10.5C3 11.3284 2.32843 12 1.5 12V15C1.5 16.1046 2.39543 17 3.5 17H20.5C21.6046 17 22.5 16.1046 22.5 15V12C21.6716 12 21 11.3284 21 10.5Z" stroke="#E78720" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 4V17" stroke="#E78720" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3"/>
    <circle cx="14.5" cy="10.5" r="2.5" stroke="#E78720" strokeWidth="1.5"/>
  </svg>
);

// Icon Xu (Coin)
const CoinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#EAB308" strokeWidth="1.5"/>
    <path d="M12 16V8" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 8H12.5C13.8807 8 15 9.11929 15 10.5C15 11.8807 13.8807 13 12.5 13H11.5C10.1193 13 9 14.1193 9 15.5C9 16.8807 10.1193 18 11.5 18H14" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (val: boolean) => void }> =
  ({ enabled, setEnabled }) => (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 ${
        enabled ? 'bg-brand-orange' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

const VoucherSection: React.FC<VoucherSectionProps> = ({
  onSelectVoucher,
  selectedVoucherText = "Chọn hoặc nhập mã",
  discountAmount = 0,
  useCoins,
  onToggleCoins,
  coinBalance = 0
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* 1. Phần chọn Voucher */}
      <div 
        onClick={onSelectVoucher}
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-orange-50/30 transition-colors group border-b border-dashed border-gray-200"
      >
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TicketIcon />
           </div>
           <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-base group-hover:text-brand-orange transition-colors">LoveGifts Voucher</span>
              <span className={`text-sm ${discountAmount > 0 ? 'text-brand-orange font-medium' : 'text-gray-400'}`}>
                {selectedVoucherText}
              </span>
           </div>
        </div>

        <div className="flex items-center gap-2">
           {discountAmount > 0 && (
             <span className="hidden sm:block bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
               -{discountAmount.toLocaleString('vi-VN')}đ
             </span>
           )}
           <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors" />
        </div>
      </div>

      {/* 2. Phần dùng Xu */}
      <div className="flex justify-between items-center p-5 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center">
             <CoinIcon />
          </div>
          <div className="flex flex-col">
             <span className="font-semibold text-gray-800 text-base">Dùng LoveGifts Xu</span>
             <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Số dư: <span className="font-medium text-black">{coinBalance.toLocaleString()}</span></span>
                {useCoins && (
                  <span className="text-brand-orange font-medium text-xs bg-orange-100 px-1.5 py-0.5 rounded">
                    -{(coinBalance > 10000 ? 10000 : coinBalance).toLocaleString()}đ
                  </span>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <span className={`text-sm font-medium transition-colors ${useCoins ? 'text-brand-orange' : 'text-gray-400'}`}>
             {useCoins ? 'Đang dùng' : 'Tắt'}
           </span>
           <ToggleSwitch enabled={useCoins} setEnabled={onToggleCoins} />
        </div>
      </div>
    </div>
  );
};

export default VoucherSection;