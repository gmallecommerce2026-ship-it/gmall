'use client';

import React from 'react';
import { FiMessageSquare, FiBell, FiFileText } from 'react-icons/fi'; // Icon thay thế cho ảnh
import classNames from 'classnames';

export const SellerUtilityBar = () => {
  return (
    <div className="w-[48px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-2 h-[calc(100vh-100px)] sticky top-[100px]">
      
      {/* Icon 1: Tài liệu / Hướng dẫn (SvgAsset3) */}
      <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-500">
         <FiFileText size={20} />
      </div>

      {/* Icon 2: Thông báo (SvgAsset2) */}
      <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-500">
         <FiBell size={20} />
      </div>

      {/* Icon 3: Chat (SvgAsset1) - Có Badge */}
      <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-500">
        <FiMessageSquare size={20} />
        
        {/* Badge Số lượng (5) */}
        <div className="absolute top-2 right-2 bg-[#E78720] text-white text-[10px] font-normal rounded-[9px] border border-white h-[17px] min-w-[17px] px-1 flex items-center justify-center leading-none">
          5
        </div>
      </div>

    </div>
  );
};