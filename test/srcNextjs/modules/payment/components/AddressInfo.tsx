// src/modules/payment/components/AddressInfo.tsx
import React from 'react';
import { IAddress } from '@/services/address.service';

interface Props {
  address: IAddress | null;
  onClick: () => void;
}

const AddressInfo: React.FC<Props> = ({ address, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-[15px] border border-[#e78720] shadow-[0_4px_20px_rgba(231,135,32,0.08)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md cursor-pointer group relative"
    >
      <div className="flex flex-col gap-2">
          {address ? (
            <>
                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xl text-black font-bold group-hover:text-brand-orange transition-colors">{address.name}</span>
                    {address.isDefault && <span className="text-xs font-bold text-brand-orange bg-orange-100 px-2 py-0.5 rounded border border-orange-200">Mặc định</span>}
                    <span className="text-[15px] text-[#7a7b7b] font-normal">{address.phone}</span>
                </div>
                <span className="text-base text-[#414141] font-normal line-clamp-2">
                    {address.fullAddress}
                </span>
            </>
          ) : (
            <span className="text-red-500 font-bold text-base flex items-center gap-2 animate-pulse">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               Chưa có địa chỉ nhận hàng. Vui lòng thêm mới!
            </span>
          )}
      </div>
      <button className="relative w-8 h-8 flex-shrink-0 self-end sm:self-center cursor-pointer hover:scale-110 transition-transform">
          <img className="w-full h-full" src="/assets-gift-payment/SvgAsset11.svg" alt="Edit" />
      </button>
    </div>
  );
};

export default AddressInfo;