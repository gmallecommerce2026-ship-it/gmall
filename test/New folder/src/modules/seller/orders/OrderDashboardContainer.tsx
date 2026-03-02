// src/modules/seller/orders/OrderDashboardContainer.tsx
'use client';

import React, { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import OrderMainTabs from './components/OrderMainTabs';
import OrderManagementPage from './OrderManagementPage'; // File tôi vừa refactor ở trên
import BulkDeliveryPage from './bulk-delivery/BulkDeliveryPage'; // File cũ của bạn
import SellerDeliveryDashboard from './bulk-delivery/SellerDeliveryDashboard';

// Định nghĩa các tab chính của Dashboard
const DASHBOARD_TABS = [
  { id: 'all', label: 'Tất cả', isActive: true, count: 120 },
  { id: 'bulk_delivery', label: 'Giao hàng loạt', isActive: false },
  { id: 'handover', label: 'Bàn Giao Đơn Hàng', isActive: false },
  { id: 'return_refund', label: 'Đơn Trả hàng/Hoàn tiền', isActive: false },
  { id: 'settings', label: 'Cài Đặt Vận Chuyển', isActive: false },
];

const OrderDashboardContainer = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Hàm render nội dung dựa trên Tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        // Đây là giao diện quản lý đơn hàng mặc định (Code vừa clean)
        return <OrderManagementPage />;
      
      case 'bulk_delivery':
        // Đây là giao diện Giao hàng loạt (Code cũ của bạn giữ nguyên)
        return <BulkDeliveryPage isEmbedded={true} />;
        
      case 'handover':
        return <SellerDeliveryDashboard />;
        
      default:
        return <OrderManagementPage />;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 font-sans">
      
      {/* 1. Header Chung cho Dashboard (Breadcrumb & Tabs) */}
      {/* Lưu ý: Nếu BulkDeliveryPage đã có Header riêng, ta có thể ẩn Header này khi ở tab đó, 
         hoặc sửa BulkDeliveryPage để bỏ Header đi cho đồng bộ. 
         Ở đây tôi giữ Header chung để điều hướng Tab. */}
      
      <div className="bg-white shadow-sm sticky top-0 z-40 w-full px-8 pt-4 pb-0">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="hover:text-[#E78720] cursor-pointer">Trang chủ</span> 
            <FiChevronRight className="text-gray-400" /> 
            <span className="text-gray-900 font-medium">Quản lý đơn hàng</span>
         </div>

         {/* Navigation Tabs (Giữ nguyên component Tabs xịn xò vừa làm) */}
         <OrderMainTabs 
            tabs={DASHBOARD_TABS.map(t => ({ ...t, isActive: t.id === activeTab }))} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
         />
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 w-full">
        {renderContent()}
      </div>

    </div>
  );
};

export default OrderDashboardContainer;