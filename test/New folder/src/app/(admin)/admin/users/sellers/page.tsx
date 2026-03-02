// src/app/(admin)/admin/users/sellers/page.tsx
'use client';

import React from 'react';
import { FiSearch, FiFilter, FiMoreVertical, FiUserCheck, FiSlash } from 'react-icons/fi';

const MOCK_SELLERS = [
  { id: 1, shopName: 'Gift Shop HCM', owner: 'Nguyễn Văn A', email: 'a@gmail.com', revenue: '120.5M', status: 'Active', joinDate: '12/10/2024' },
  { id: 2, shopName: 'Lovely Candles', owner: 'Trần Thị B', email: 'b@gmail.com', revenue: '45.2M', status: 'Pending', joinDate: '14/12/2025' },
  { id: 3, shopName: 'Handmade Zone', owner: 'Lê Văn C', email: 'c@gmail.com', revenue: '8.1M', status: 'Banned', joinDate: '05/11/2024' },
];

export default function SellersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh sách Người bán</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản và trạng thái hoạt động của đối tác bán hàng.</p>
        </div>
        <button className="bg-[#E78720] text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-orange-600 transition-colors">
          + Thêm người bán
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên shop, email..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E78720]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          <FiFilter /> Lọc trạng thái
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Tên Shop</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Chủ sở hữu</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Doanh thu</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SELLERS.map((seller) => (
              <tr key={seller.id} className="border-b border-gray-50 hover:bg-orange-50/10 transition-colors">
                <td className="p-4 text-gray-500">#{seller.id}</td>
                <td className="p-4">
                  <p className="font-medium text-gray-800">{seller.shopName}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-gray-800">{seller.owner}</p>
                  <p className="text-xs text-gray-500">{seller.email}</p>
                </td>
                <td className="p-4 text-gray-800 font-medium">{seller.revenue}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    seller.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' :
                    seller.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                    'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {seller.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                   <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded text-gray-500" title="Chi tiết"><FiMoreVertical /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}