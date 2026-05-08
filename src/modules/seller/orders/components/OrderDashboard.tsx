'use client';

import React, { useState, useEffect } from 'react';
import OrderTable from './OrderTable';
import { Search, Filter } from 'lucide-react';

// Mapping từ Tab trên URL (OrderManagementPage) sang Status của API (Prisma Enum)
const TAB_TO_STATUS_MAP: Record<string, string> = {
  'all': 'all',
  'handover': 'CONFIRMED', // Bàn giao = Đã xác nhận/Chờ lấy
  'return': 'CANCELLED',   // Tạm map Trả hàng = Đã hủy (hoặc RETURNED nếu DB có)
  'bulk-delivery': 'all'   // Fallback
};

const ORDER_STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'CONFIRMED', label: 'Chờ lấy hàng' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'DELIVERED', label: 'Đã giao' },
  { id: 'CANCELLED', label: 'Đơn hủy' },
];

interface OrderDashboardProps {
  defaultTab?: string;
}

const OrderDashboard = ({ defaultTab = 'all' }: OrderDashboardProps) => {
  // 1. Xác định status khởi tạo dựa trên defaultTab được truyền vào
  const initialStatus = TAB_TO_STATUS_MAP[defaultTab] || 'all';
  
  const [activeStatus, setActiveStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Lắng nghe sự thay đổi của defaultTab (khi user bấm tab trên OrderManagementPage)
  // hooks-fix wiki 0031: derived state sync — guard với check khác để tránh re-render thừa
  useEffect(() => {
    const mappedStatus = TAB_TO_STATUS_MAP[defaultTab] || 'all';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveStatus(prev => (prev === mappedStatus ? prev : mappedStatus));
  }, [defaultTab]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Search & Filter - Giữ nguyên */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Tìm đơn hàng theo Mã đơn, Tên khách hàng..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
             <Filter size={16} /> Bộ lọc
           </button>
        </div>
      </div>

      {/* Status Sub-Tabs */}
      <div className="border-b border-gray-100 mb-6">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {ORDER_STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                activeStatus === tab.id 
                  ? 'border-brand-orange text-brand-orange' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Table */}
      <OrderTable status={activeStatus} searchQuery={searchQuery} />
    </div>
  );
};

export default OrderDashboard;