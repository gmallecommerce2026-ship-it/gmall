'use client';

import React from 'react';
import { FiTruck, FiAlertTriangle, FiSettings } from 'react-icons/fi';

export default function ShippingSystemPage() {
  // Wiki 0104 (đợt 2): danh sách cũ ghi "GHTK — Đã kết nối" và "SPX Express — Bảo trì".
  // Cả hai đều KHÔNG có thật: BE chỉ có module `ghn/` với đúng ba biến môi trường
  // `GHN_API_URL`, `GHN_SHOP_ID`, `GHN_TOKEN` — không có dòng mã nào cho GHTK hay SPX.
  // Ghi "đã kết nối" cho một hãng chưa tích hợp sẽ khiến người vận hành tưởng có thể
  // chọn hãng đó khi giao đơn.
  const providers = [
      { name: 'Giao Hàng Nhanh (GHN)', logo: 'GHN', color: 'bg-orange-500', status: 'Đã tích hợp', note: 'Cấu hình qua biến môi trường GHN_*' },
  ];

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Cấu Hình Vận Chuyển</h1>

        {/* Alert Maintenance */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <FiAlertTriangle className="text-yellow-600 mt-1 shrink-0" size={20} />
            <div>
                <h3 className="font-bold text-yellow-800">Tính năng đang phát triển</h3>
                <p className="text-sm text-yellow-700 mt-1">
                    Module cấu hình API vận chuyển đang được xây dựng. Hiện tại hệ thống sử dụng cấu hình mặc định trong ENV. 
                    Vui lòng quay lại sau để cập nhật API Key và phí vận chuyển chi tiết.
                </p>
            </div>
        </div>

        {/* List Providers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((p, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm opacity-75">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs ${p.color}`}>
                            {p.logo}
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{p.status}</span>
                    </div>
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{p.note}</p>

                    <button disabled className="mt-4 w-full py-2 border border-gray-200 rounded text-sm text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed">
                        <FiSettings size={14} /> Cấu hình (Coming soon)
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
}