'use client';

import React, { useState } from 'react';
import { FiSearch, FiFilter, FiAlertTriangle, FiLock, FiUnlock, FiTrash2, FiMoreVertical } from 'react-icons/fi';

// Mock data
const VIOLATION_DATA = [
  { id: 1, shopName: 'Tech World Official', reason: 'Bán hàng giả/nhái', reportCount: 15, status: 'locked', date: '2025-12-10' },
  { id: 2, shopName: 'Beauty Store VN', reason: 'Spam tin nhắn khách hàng', reportCount: 5, status: 'warning', date: '2025-12-12' },
  { id: 3, shopName: 'Gia Dụng Thông Minh', reason: 'Không giao hàng đúng hạn', reportCount: 8, status: 'locked', date: '2025-12-09' },
  { id: 4, shopName: 'Baby Care', reason: 'Hình ảnh nhạy cảm', reportCount: 3, status: 'resolved', date: '2025-12-01' },
];

export default function ShopViolationsPage() {
  const [filter, setFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'locked':
        return <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">Đã khóa</span>;
      case 'warning':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full font-medium">Cảnh báo</span>;
      case 'resolved':
        return <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">Đã xử lý</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vi phạm & Khóa Shop</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các cửa hàng vi phạm chính sách và xử lý khiếu nại.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors">
            <FiFilter /> Lọc trạng thái
          </button>
          <button className="px-4 py-2 bg-[#E78720] text-white rounded-lg hover:bg-[#d17615] flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
            <FiAlertTriangle /> Xử lý vi phạm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Shop đang bị khóa</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">24</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <FiLock size={20} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Cảnh báo vi phạm</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">12</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                <FiAlertTriangle size={20} />
            </div>
        </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Đã xử lý tuần này</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">45</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <FiUnlock size={20} />
            </div>
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <h3 className="font-semibold text-gray-700">Danh sách vi phạm</h3>
           <div className="relative w-64">
             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
                type="text" 
                placeholder="Tìm kiếm Shop..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#E78720] focus:ring-1 focus:ring-[#E78720]"
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Tên Cửa Hàng</th>
                <th className="px-6 py-4">Lý do vi phạm</th>
                <th className="px-6 py-4 text-center">Số báo cáo</th>
                <th className="px-6 py-4">Ngày vi phạm</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {VIOLATION_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors text-sm">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.shopName}</td>
                  <td className="px-6 py-4 text-gray-600">{item.reason}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {item.reportCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {item.status === 'locked' ? (
                            <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg tooltip" title="Mở khóa">
                                <FiUnlock size={16} />
                            </button>
                        ) : (
                            <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg tooltip" title="Khóa Shop">
                                <FiLock size={16} />
                            </button>
                        )}
                         <button className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg">
                            <FiMoreVertical size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-gray-100 flex justify-center">
            <div className="flex gap-1 text-sm">
                <button className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50">Trước</button>
                <button className="px-3 py-1 rounded bg-[#E78720] text-white">1</button>
                <button className="px-3 py-1 rounded border hover:bg-gray-50">2</button>
                <button className="px-3 py-1 rounded border hover:bg-gray-50">Sau</button>
            </div>
        </div>
      </div>
    </div>
  );
}