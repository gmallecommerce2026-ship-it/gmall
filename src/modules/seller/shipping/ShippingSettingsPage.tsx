// src/modules/seller/shipping/ShippingSettingsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { FiInfo, FiMapPin, FiTruck, FiFileText, FiSave } from 'react-icons/fi';
import ShippingChannelCard from './components/ShippingChannelCard';
import { ShippingChannel, SettingsTabId } from './types';
import { AddressSelector } from '@/components/common/AddressSelector'; // Import component mới
import { apiClient } from '@/lib/api/ApiClient';
import { toast } from 'react-hot-toast';

// --- Mock Data (Giữ nguyên phần này) ---
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
  { id: 'address', label: 'Địa chỉ kho hàng', icon: <FiMapPin /> },
  { id: 'shipping_unit', label: 'Đơn vị vận chuyển', icon: <FiTruck /> },
  { id: 'documents', label: 'Chứng từ vận chuyển', icon: <FiFileText /> },
];

const ShippingSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('shipping_unit');
  const [channels, setChannels] = useState<ShippingChannel[]>(INITIAL_DATA);
  
  // State cho Address Tab
  const [shopAddress, setShopAddress] = useState<any>({});
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load thông tin Shop Address khi chuyển sang tab Address
  useEffect(() => {
    if (activeTab === 'address') {
        setIsLoadingAddress(true);
        apiClient.get('/shops/me')
            .then((res: any) => {
                if (res) {
                    // [FIX] Ép kiểu dữ liệu để đảm bảo AddressSelector nhận đúng Number
                    // AddressSelector dùng GHN API trả về ID là số, nên cần ép kiểu
                    setShopAddress({
                        provinceId: res.provinceId ? Number(res.provinceId) : undefined,
                        districtId: res.districtId ? Number(res.districtId) : undefined,
                        wardCode: res.wardCode ? String(res.wardCode) : undefined, // WardCode thường là string
                        fullAddress: res.pickupAddress || '',
                        // Logic tách địa chỉ cụ thể
                        specificAddress: res.pickupAddress ? res.pickupAddress.split(',')[0] : '', 
                        lat: res.lat || 0,
                        lng: res.lng || 0
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                toast.error("Không thể tải thông tin địa chỉ");
            })
            .finally(() => setIsLoadingAddress(false));
    }
  }, [activeTab]);

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

  const handleSaveAddress = async () => {
    if (!shopAddress.provinceId || !shopAddress.districtId || !shopAddress.wardCode) {
        toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã");
        return;
    }

    setIsSaving(true);
    try {
        // Gọi API update profile
        // Lưu ý: Backend cần update DTO UpdateShopProfileDto để nhận các trường provinceId...
        await apiClient.put('/shops/me/profile', {
            pickupAddress: shopAddress.fullAddress, // Chuỗi hiển thị full
            provinceId: shopAddress.provinceId,
            districtId: shopAddress.districtId,
            wardCode: shopAddress.wardCode,
            lat: shopAddress.lat,
            lng: shopAddress.lng
        });
        toast.success("Cập nhật địa chỉ kho thành công!");
    } catch (error) {
        toast.error("Lỗi khi lưu địa chỉ");
    } finally {
        setIsSaving(false);
    }
  };

  // --- Render content based on tab ---
  const renderContent = () => {
    // 1. Tab Address (Đã nâng cấp)
    if (activeTab === 'address') {
        if (isLoadingAddress) return <div className="p-10 text-center text-gray-500">Đang tải thông tin...</div>;
        
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <div className="p-2 bg-orange-100 text-brand-orange rounded-full"><FiMapPin size={20}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Địa chỉ lấy hàng</h3>
                        <p className="text-sm text-gray-500">Shipper sẽ đến địa chỉ này để nhận hàng. Vui lòng ghim chính xác.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2">
                        <AddressSelector 
                            value={shopAddress}
                            onChange={setShopAddress}
                        />
                     </div>
                     
                     <div className="bg-gray-50 p-4 rounded-xl h-fit border border-gray-100">
                        <h4 className="font-bold text-gray-700 mb-2 text-sm">Thông tin hiển thị</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p><span className="font-medium">Địa chỉ đầy đủ:</span><br/> {shopAddress.fullAddress || '---'}</p>
                            <p><span className="font-medium">Toạ độ:</span><br/> {shopAddress.lat?.toFixed(5)}, {shopAddress.lng?.toFixed(5)}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                             <button 
                                onClick={handleSaveAddress}
                                disabled={isSaving}
                                className="w-full py-2.5 bg-brand-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                             >
                                {isSaving ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <FiSave />}
                                Lưu Thay Đổi
                             </button>
                        </div>
                     </div>
                </div>
            </div>
        );
    }

    // 2. Tab Shipping Unit
    if (activeTab === 'shipping_unit') {
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Warning / Note Section */}
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 p-4 rounded-sm text-sm text-gray-700">
              <FiInfo className="text-[#E78720] mt-0.5 shrink-0" size={16} />
              <div>
                <p className="font-medium text-[#E78720] mb-1">Lưu ý quan trọng</p>
                <p>G-Mall không hỗ trợ theo dõi quá trình cho các phương thức vận chuyển không có tích hợp và cũng sẽ không chịu trách nhiệm về bất kỳ sản phẩm nào bị thiếu hoặc hư hỏng.</p>
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
    }

    // 3. Tab Documents
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-sm">
          <p className="text-gray-500">Tính năng quản lý chứng từ đang phát triển...</p>
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