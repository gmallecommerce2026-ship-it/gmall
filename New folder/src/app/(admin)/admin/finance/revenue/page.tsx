// src/app/(admin)/admin/finance/revenue/page.tsx
'use client';

import React from 'react';
import { FiDollarSign, FiArrowUpRight, FiArrowDownRight, FiCreditCard } from 'react-icons/fi';

export default function RevenuePage() {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu sàn</h1>

       {/* Overview Cards */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#E78720] to-[#FFB05C] rounded-lg p-6 text-white shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-orange-100 font-medium mb-1">Tổng doanh thu (GMV)</p>
                   <h2 className="text-3xl font-bold">12.5 Tỷ ₫</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-lg"><FiDollarSign size={24}/></div>
             </div>
             <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                <FiArrowUpRight/> +15.3% so với tháng trước
             </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-gray-500 font-medium mb-1">Lợi nhuận ròng (Phí sàn)</p>
                   <h2 className="text-3xl font-bold text-gray-800">1.2 Tỷ ₫</h2>
                </div>
                <div className="bg-green-100 text-green-600 p-2 rounded-lg"><FiCreditCard size={24}/></div>
             </div>
             <p className="text-sm text-gray-400 mt-4">Phí giao dịch trung bình: 8%</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-gray-500 font-medium mb-1">Chờ thanh toán (Payout)</p>
                   <h2 className="text-3xl font-bold text-gray-800">450 Triệu ₫</h2>
                </div>
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FiDollarSign size={24}/></div>
             </div>
             <button className="text-sm text-[#E78720] font-medium mt-4 hover:underline">
                Xem yêu cầu rút tiền &rarr;
             </button>
          </div>
       </div>

       {/* Chart Section Placeholder */}
       <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ dòng tiền (12 tháng qua)</h3>
          <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-200">
             <p className="text-gray-400">Tích hợp Chart Library (Recharts/Chart.js) tại đây</p>
          </div>
       </div>
    </div>
  );
}