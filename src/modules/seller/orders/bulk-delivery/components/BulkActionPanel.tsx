// src/modules/seller/orders/bulk-delivery/components/BulkActionPanel.tsx
'use client';

import React, { useState } from 'react';
import classNames from 'classnames';
import { FiChevronDown, FiMapPin, FiTruck, FiBox } from 'react-icons/fi';

export const BulkActionPanel = ({ selectedCount = 0 }: { selectedCount: number }) => {
  const [method, setMethod] = useState<'pickup' | 'dropoff'>('pickup');

  return (
    <div className="w-[340px] flex-shrink-0 bg-white border-l border-gray-200 h-[calc(100vh-80px)] sticky top-[80px] overflow-y-auto p-6 flex flex-col gap-6 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Chuẩn bị hàng loạt</h2>
        <p className="text-gray-500 font-light text-sm">
          {selectedCount} kiện hàng được chọn
        </p>
      </div>

      {/* Action Box */}
      <div className="border border-gray-300 rounded-lg p-5 flex flex-col gap-5 bg-white">
        
        {/* Method Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-full relative">
            <button
                onClick={() => setMethod('pickup')}
                className={classNames(
                    "flex-1 py-3 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                    method === 'pickup' ? "bg-white text-[#E78720] shadow-md" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <FiTruck /> Pickup
            </button>
            <button
                onClick={() => setMethod('dropoff')}
                className={classNames(
                    "flex-1 py-3 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                    method === 'dropoff' ? "bg-white text-[#E78720] shadow-md" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <FiBox /> Drop off
            </button>
        </div>

        {method === 'pickup' ? (
            <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-light">Địa chỉ lấy hàng</span>
                    <button className="text-[#2D80E2] font-medium hover:underline">Đổi</button>
                </div>
                
                <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                    <div className="font-medium text-gray-900 text-sm mb-1">Nguyễn Minh Tiến - 84961752201</div>
                    <div className="text-gray-500 text-xs flex gap-2 items-start mt-2">
                        <FiMapPin className="mt-0.5 flex-shrink-0 text-[#E78720]" />
                        Phường Phúc Lợi, Quận Long Biên, Hà Nội
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ngày lấy hàng</label>
                    <button className="w-full px-4 py-3 border border-[#E78720] rounded-lg bg-white flex items-center justify-between hover:bg-orange-50 transition-colors">
                        <span className="text-[#E78720] font-medium">Hôm nay (14/12)</span>
                        <FiChevronDown className="text-[#E78720]" />
                    </button>
                </div>

                <button className="w-full bg-[#E78720] hover:bg-[#d17515] text-white font-bold py-3.5 px-4 rounded-full shadow-lg shadow-orange-200 transition-all active:scale-95">
                    Yêu cầu ĐVVC đến lấy hàng
                </button>
            </div>
        ) : (
             <div className="flex flex-col gap-4 py-4 animate-fadeIn">
                 <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                     Vui lòng mang hàng ra bưu cục gần nhất để gửi.
                 </div>
                 <button className="w-full bg-[#E78720] hover:bg-[#d17515] text-white font-bold py-3.5 px-4 rounded-full shadow-lg transition-all active:scale-95">
                    Xác nhận gửi hàng tại bưu cục
                </button>
             </div>
        )}
      </div>
    </div>
  );
};