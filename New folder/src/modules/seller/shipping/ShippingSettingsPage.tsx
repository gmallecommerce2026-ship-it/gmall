// src/modules/seller/shipping/ShippingSettingsPage.tsx
'use client';

import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { FiInfo, FiMapPin, FiTruck, FiFileText } from 'react-icons/fi';
import ShippingChannelCard from './components/ShippingChannelCard';
import { ShippingChannel, SettingsTabId } from './types';

// --- Mock Data (Mô phỏng dữ liệu gốc) ---
const INITIAL_DATA: ShippingChannel[] = [
  {
    id: 'express',
    name: 'Hỏa Tốc',
    description: 'Phương thức vận chuyển giao đến Người mua trong thời gian sớm nhất',
    isEnabled: true,
    services: [
      { id: 'express_instant', name: 'Hỏa Tốc - Trong Ngày', isEnabled: true, isCodEnabled: true },
      { id: 'express_4h', name: 'Hỏa Tốc - 4 Giờ', isEnabled: false },
    ]
  },
  {
    id: 'fast',
    name: 'Nhanh',
    description: 'Phương thức vận chuyển chuyên nghiệp, nhanh chóng và đáng tin cậy',
    isEnabled: true,
    services: [
        { id: 'fast_standard', name: 'Giao Hàng Nhanh', isEnabled: true, isCodEnabled: true },
        { id: 'fast_economy', name: 'Giao Hàng Tiết Kiệm', isEnabled: true, isCodEnabled: true },
    ]
  },
  {
    id: 'bulky',
    name: 'Hàng Cồng Kềnh',
    description: 'Cho phép Người mua tự nhận đơn hàng tại địa điểm và thời gian thuận tiện hoặc vận chuyển hàng lớn',
    isEnabled: false,
    services: []
  },
];

const TABS = [
  { id: 'address', label: 'Địa chỉ', icon: <FiMapPin /> },
  { id: 'shipping_unit', label: 'Đơn vị vận chuyển', icon: <FiTruck /> },
  { id: 'documents', label: 'Chứng từ vận chuyển', icon: <FiFileText /> },
];

const ShippingSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('shipping_unit');
  const [channels, setChannels] = useState<ShippingChannel[]>(INITIAL_DATA);

  // --- Handlers ---
  const handleToggleChannel = (id: string, value: boolean) => {
    setChannels(prev => prev.map(ch => 
      ch.id === id ? { ...ch, isEnabled: value } : ch
    ));
  };

  const handleToggleService = (channelId: string, serviceId: string, value: boolean) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== channelId) return ch;
      return {
        ...ch,
        services: ch.services.map(s => s.id === serviceId ? { ...s, isEnabled: value } : s)
      };
    }));
  };

  // --- Render content based on tab ---
  const renderContent = () => {
    if (activeTab !== 'shipping_unit') {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-sm">
          <p className="text-gray-500">Tính năng đang phát triển...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Warning / Note Section */}
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 p-4 rounded-sm text-sm text-gray-700">
          <FiInfo className="text-[#E78720] mt-0.5 shrink-0" size={16} />
          <div>
            <p className="font-medium text-[#E78720] mb-1">Lưu ý quan trọng</p>
            <p>Lovegift không hỗ trợ theo dõi quá trình cho các phương thức vận chuyển không có tích hợp và cũng sẽ không chịu trách nhiệm về bất kỳ sản phẩm nào bị thiếu hoặc hư hỏng.</p>
          </div>
        </div>

        {/* Channel List */}
        <div>
           {channels.map(channel => (
             <ShippingChannelCard 
                key={channel.id} 
                channel={channel} 
                onToggleChannel={handleToggleChannel}
                onToggleService={handleToggleService}
             />
           ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
           <button className="text-[#E78720] font-medium text-sm hover:underline">
             + Thêm đơn vị vận chuyển khác
           </button>
           <button className="px-6 py-2 bg-[#E78720] text-white rounded hover:bg-[#cf7618] transition-colors shadow-sm shadow-orange-200">
             Lưu Cấu Hình
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cài Đặt Vận Chuyển</h1>
      
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 bg-white sticky top-0 z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTabId)}
            className={classNames(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors relative top-[2px]",
              {
                "border-[#E78720] text-[#E78720]": activeTab === tab.id,
                "border-transparent text-gray-500 hover:text-gray-700": activeTab !== tab.id
              }
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default ShippingSettingsPage;