'use client';

import React, { useState, useEffect } from 'react';
import MenuConfigEditor from '@/components/admin/content/MenuConfigEditor';
import { ContentService, SYSTEM_MENU_KEYS } from '@/services/ContentService';
import { toast } from 'react-hot-toast';

const MENUS = [
  { id: SYSTEM_MENU_KEYS.RECIPIENT, label: 'Menu Người Nhận' },
  { id: SYSTEM_MENU_KEYS.OCCASION, label: 'Menu Ngày Lễ & Sự Kiện' },
  { id: SYSTEM_MENU_KEYS.BUSINESS, label: 'Menu Quà Doanh Nghiệp' },
  { id: SYSTEM_MENU_KEYS.BLOG, label: 'Menu Chủ Đề Blog' },
];

export default function MenuManagementPage() {
  const [activeKey, setActiveKey] = useState(SYSTEM_MENU_KEYS.RECIPIENT);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig(activeKey);
  }, [activeKey]);

  const loadConfig = async (key: string) => {
    setLoading(true);
    try {
      const res = await ContentService.getConfig(key);
      setData(res || []);
    } catch (error) {
      toast.error('Lỗi tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newData: any[]) => {
    setLoading(true);
    try {
      await ContentService.saveConfig(activeKey, newData);
      toast.success('Lưu cấu hình menu thành công!');
      setData(newData);
    } catch (error) {
      toast.error('Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Menu & Navigation</h1>
      
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto">
        {MENUS.map(menu => (
          <button
            key={menu.id}
            onClick={() => setActiveKey(menu.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
              ${activeKey === menu.id 
                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            {menu.label}
          </button>
        ))}
      </div>

      <MenuConfigEditor
        key={activeKey} // Force re-render khi đổi tab
        title={`Cấu hình: ${MENUS.find(m => m.id === activeKey)?.label}`}
        initialData={data}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
}