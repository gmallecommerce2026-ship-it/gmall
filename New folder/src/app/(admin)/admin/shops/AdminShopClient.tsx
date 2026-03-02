// src/app/(admin)/admin/shops/page.tsx
'use client';

import React from 'react';
import { FiShoppingBag, FiStar, FiPackage, FiMapPin } from 'react-icons/fi';

const MOCK_SHOPS = [
  { id: 'S01', name: 'Love Gifts Official', rating: 4.8, products: 120, location: 'Hà Nội', avatar: 'LG' },
  { id: 'S02', name: 'Phụ Kiện Xinh', rating: 4.5, products: 85, location: 'TP.HCM', avatar: 'PK' },
  { id: 'S03', name: 'Gốm Sứ Bát Tràng', rating: 4.9, products: 203, location: 'Hà Nội', avatar: 'GS' },
  { id: 'S04', name: 'Tiệm Hoa Khô', rating: 4.2, products: 45, location: 'Đà Nẵng', avatar: 'TH' },
];

export default function ShopClient() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cửa hàng đang hoạt động</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_SHOPS.map((shop) => (
          <div key={shop.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#E78720] font-bold text-lg">
                {shop.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-[#E78720] transition-colors">{shop.name}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">ID: {shop.id}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><FiStar className="text-yellow-400"/> Đánh giá:</span>
                <span className="font-medium">{shop.rating}/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><FiPackage className="text-blue-400"/> Sản phẩm:</span>
                <span className="font-medium">{shop.products}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><FiMapPin className="text-red-400"/> Kho hàng:</span>
                <span className="font-medium">{shop.location}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
              <button className="flex-1 py-2 text-xs font-medium bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                Xem shop
              </button>
              <button className="flex-1 py-2 text-xs font-medium bg-[#E78720]/10 text-[#E78720] rounded hover:bg-[#E78720]/20">
                Quản lý
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}