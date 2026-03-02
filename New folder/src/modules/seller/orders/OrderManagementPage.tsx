// src/modules/seller/orders/OrderManagementPage.tsx
'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderMainTabs from './components/OrderMainTabs';
import OrderDashboard from './components/OrderDashboard';
import SellerDeliveryDashboard from './bulk-delivery/SellerDeliveryDashboard';
import { MainTab, OrderTabStatus } from './types'; // Import type

const OrderManagementPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabMapping: Record<string, OrderTabStatus> = {
    'all': 'all',
    'bulk-delivery': 'bulk-delivery',
    'handover': 'handover',
    'return': 'return'
  };

  const tabParam = searchParams.get('tab');
  // Ép kiểu hoặc kiểm tra an toàn để đảm bảo activeTab thuộc OrderTabStatus
  const activeTab: OrderTabStatus = (tabParam && tabMapping[tabParam]) ? tabMapping[tabParam] : 'all';

  const handleTabChange = (tabId: string) => {
    router.push(`/seller-dashboard/orders?tab=${tabId}`, { scroll: false });
  };

  // --- KHAI BÁO DANH SÁCH TABS (FIX LỖI UNDEFINED MAP) ---
  const tabList: MainTab[] = [
    { id: 'all', label: 'Tất cả', isActive: activeTab === 'all' },
    { id: 'bulk-delivery', label: 'Giao hàng loạt', isActive: activeTab === 'bulk-delivery' },
    { id: 'handover', label: 'Bàn giao đơn hàng', isActive: activeTab === 'handover' },
    { id: 'return', label: 'Trả hàng / Hoàn tiền', isActive: activeTab === 'return' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'bulk-delivery':
        return <SellerDeliveryDashboard />;
      case 'all':
      case 'handover':
      case 'return':
      default:
        return <OrderDashboard defaultTab={activeTab} />;
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý tất cả đơn hàng của bạn</p>
        </div>
      </div>

      {/* Truyền prop tabs={tabList} để sửa lỗi */}
      <OrderMainTabs 
        tabs={tabList} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      <div className="transition-all duration-300">
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderManagementPage;