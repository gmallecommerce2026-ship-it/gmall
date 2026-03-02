'use client';
import React from 'react';
import { Gift } from 'lucide-react';

export default function RewardPointsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Lovegifts Xu</h1>

      {/* Card tổng điểm */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-8 shadow-lg flex items-center justify-between">
         <div>
             <p className="text-yellow-100 text-sm font-medium mb-1">Điểm tích lũy hiện tại</p>
             <div className="text-4xl font-bold flex items-center gap-2">
                2,450 <span className="text-lg font-normal opacity-80">Xu</span>
             </div>
         </div>
         <Gift size={48} className="text-white opacity-80" />
      </div>

      <h2 className="font-bold text-gray-800 mb-4">Lịch sử giao dịch</h2>
      <div className="space-y-0 divide-y divide-gray-100 border border-gray-100 rounded-lg">
         {[1, 2, 3].map((i) => (
             <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                    <p className="text-gray-800 font-medium">Mua hàng thành công - Đơn #DH9283</p>
                    <p className="text-xs text-gray-500">20/12/2024 14:30</p>
                </div>
                <span className="text-green-600 font-bold">+ 200 Xu</span>
             </div>
         ))}
         <div className="p-4 flex justify-between items-center hover:bg-gray-50">
            <div>
                <p className="text-gray-800 font-medium">Đổi mã giảm giá 50k</p>
                <p className="text-xs text-gray-500">18/12/2024 09:15</p>
            </div>
            <span className="text-gray-500 font-bold">- 500 Xu</span>
         </div>
      </div>
    </div>
  );
}