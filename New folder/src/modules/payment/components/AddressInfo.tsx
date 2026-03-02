// src/modules/payment/components/AddressInfo.tsx
import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline'; // Cần cài: @heroicons/react

const AddressInfo: React.FC = () => {
  return (
    // Đã chuyển ảnh nền SVG thành class của Tailwind
    <div className="w-[759px] h-[134px] px-10 py-7 flex justify-between items-center bg-[url('/assets-payment/SvgAsset1.svg')] bg-cover bg-no-repeat">
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-4">
          <span className="font-be-vietnam-pro text-xl font-normal text-black leading-[18px]">
            Nguyễn Văn B
          </span>
          <span className="font-be-vietnam-pro text-base font-normal text-gray-500 leading-[18px]">
            (+84) 12356899
          </span>
        </div>
        <span className="font-be-vietnam-pro text-base font-normal text-gray-700 leading-[18px]">
          Tỉnh, Thành phố, Quận, Huyện, Phường, Xã
        </span>
      </div>
      {/* Thay thế ảnh SVG mũi tên bằng icon */}
      <ChevronRightIcon className="w-5 h-5 text-black" />
    </div>
  );
};

export default AddressInfo;