'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash, FiImage, FiMenu, FiLayout, FiGift, FiCalendar, FiBriefcase } from 'react-icons/fi';
import classNames from 'classnames';
import { ContentService, SYSTEM_MENU_KEYS } from '@/services/ContentService'; // [QUAN TRỌNG] Import SYSTEM_MENU_KEYS
import { toast } from 'react-hot-toast';

// Import các component
import CategoryTreeManager from '@/components/admin/content/CategoryTreeManager'; 
import MenuConfigEditor from '@/components/admin/content/MenuConfigEditor';
import FooterConfigEditor from '@/components/admin/content/FooterConfigEditor';

// --- ĐỊNH NGHĨA TABS (Dùng constant từ Service để tránh lỗi Typo) ---
const TABS = [
  { 
    id: 'banners', 
    label: 'Banner Quảng Cáo', 
    icon: <FiImage />, 
    key: null, 
    type: 'banner' 
  },
  { 
    id: 'recipient', 
    label: 'Menu Người Nhận', 
    icon: <FiGift />, 
    key: SYSTEM_MENU_KEYS.RECIPIENT, // Thay cho 'HEADER_RECIPIENT'
    type: 'menu' 
  },
  { 
    id: 'occasion', 
    label: 'Menu Ngày Lễ', 
    icon: <FiCalendar />, 
    key: SYSTEM_MENU_KEYS.OCCASION,  // Thay cho 'HEADER_OCCASION' -> Đảm bảo khớp 100%
    type: 'menu' 
  },
  { 
    id: 'business', 
    label: 'Quà Doanh Nghiệp', 
    icon: <FiBriefcase />, 
    key: SYSTEM_MENU_KEYS.BUSINESS,  // Thay cho 'HEADER_BUSINESS'
    type: 'menu' 
  },
  { 
    id: 'footer', 
    label: 'Footer Links', 
    icon: <FiLayout />, 
    key: 'FOOTER_DATA', 
    type: 'footer' 
  },
];

export default function ContentClient() {
  const [activeTabId, setActiveTabId] = useState('banners');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);

  const currentTab = TABS.find(t => t.id === activeTabId);

  useEffect(() => {
    // Reset data để tránh lọt data của tab cũ sang tab mới khi đang loading
    setConfigData(null); 

    if (currentTab?.type === 'banner') {
      loadBanners();
    } else if (currentTab?.key && currentTab.type !== 'tree') {
      loadConfig(currentTab.key);
    }
  }, [activeTabId]);

  // --- API HANDLERS ---
  const loadBanners = async () => {
    setLoading(true);
    try {
      const res: any = await ContentService.getAllBannersAdmin();
      setBanners(res || []);
    } catch (e) {
      toast.error('Không thể tải danh sách banner');
    } finally { setLoading(false); }
  };

  const loadConfig = async (key: string) => {
    setLoading(true);
    try {
      const res = await ContentService.getConfig(key);
      setConfigData(res);
    } catch (e) {
      console.error(`Lỗi tải config cho key: ${key}`, e);
      // Fallback: Menu thì trả mảng rỗng, Footer trả object rỗng
      setConfigData(currentTab?.type === 'footer' ? {} : []); 
    } finally { setLoading(false); }
  };

  const handleSaveConfig = async (data: any) => {
    // Sử dụng currentTab từ closure có thể rủi ro nếu component re-render nhanh, 
    // nhưng ở đây ta lấy key từ activeTabId hiện tại để an toàn hơn.
    const targetKey = currentTab?.key;
    
    if (!targetKey) {
        toast.error('Không xác định được Key cấu hình!');
        return;
    }

    setLoading(true);
    try {
      console.log(`Đang lưu config cho key: ${targetKey}`, data); // Log để debug
      await ContentService.saveConfig(targetKey, data);
      
      toast.success(`Đã lưu ${currentTab?.label}!`);
      setConfigData(data);
    } catch (error: any) {
      console.error("Lỗi lưu config:", error);
      // Hiển thị lỗi chi tiết từ Backend nếu có
      const msg = error?.response?.data?.message || error?.message || 'Lỗi server';
      toast.error(`Lỗi khi lưu: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER BANNERS ---
  const handleDeleteBanner = async (id: string) => {
      if(!confirm('Bạn có chắc muốn xóa banner này không?')) return;
      try {
        await ContentService.deleteBanner(id);
        setBanners(prev => prev.filter(b => b.id !== id));
        toast.success('Đã xóa banner');
      } catch (error) { toast.error('Lỗi khi xóa banner'); }
  };

  const renderBannerList = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
       <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-orange-500 hover:text-orange-500 transition-colors bg-gray-50 hover:bg-white"
            onClick={() => toast('Tính năng Thêm Banner đang phát triển')}>
          <FiPlus size={32} />
          <span className="mt-2 text-sm font-medium">Thêm Banner Mới</span>
       </div>
       {banners.map(b => (
         <div key={b.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group relative hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-100 relative">
                <img 
                  src={b.src} 
                  className="h-full w-full object-cover" 
                  alt={b.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'; }} 
                />
            </div>
            <div className="p-3">
               <p className="font-bold text-sm truncate text-gray-800">{b.title || 'No Title'}</p>
               <div className="mt-1 flex items-center justify-between">
                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{b.location}</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {b.isActive ? 'ON' : 'OFF'}
                   </span>
               </div>
            </div>
            <button onClick={() => handleDeleteBanner(b.id)} 
                    className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    title="Xóa banner">
               <FiTrash />
            </button>
         </div>
       ))}
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Nội Dung</h1>
            <p className="text-sm text-gray-500">Cấu hình Menu Header, Banner và Footer.</p>
          </div>
       </div>
       
       {/* TABS HEADER */}
       <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide bg-white px-2 sticky top-0 z-20">
          <div className="flex gap-8 min-w-max">
            {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTabId(t.id)}
                    className={classNames(
                        "py-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap px-1 text-sm font-medium outline-none", 
                        activeTabId === t.id 
                            ? "border-orange-500 text-orange-600" 
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                >
                    {t.icon} {t.label}
                </button>
            ))}
          </div>
       </div>

       {/* CONTENT AREA */}
       <div className="min-h-[500px] mt-4 animate-in fade-in duration-300">
          {/* 1. MEGA MENU (TREE) */}
          {currentTab?.type === 'tree' && (
              <CategoryTreeManager />
          )}
          
          {/* 2. BANNERS */}
          {currentTab?.type === 'banner' && renderBannerList()}

          {/* 3. MENU EDITOR */}
          {currentTab?.type === 'menu' && (
              <MenuConfigEditor 
                 // Key quan trọng: Khi đổi tab -> Key đổi -> Component remount -> Reset state
                 key={currentTab.id} 
                 title={currentTab.label}
                 initialData={configData || []}
                 loading={loading}
                 onSave={handleSaveConfig}
              />
          )}

          {/* 4. FOOTER EDITOR */}
          {currentTab?.type === 'footer' && (
              <FooterConfigEditor 
                 initialData={configData || {}}
                 loading={loading}
                 onSave={handleSaveConfig}
              />
          )}
       </div>
    </div>
  );
}