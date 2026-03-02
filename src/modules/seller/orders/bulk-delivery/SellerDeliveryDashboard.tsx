'use client';

import React, { useState, memo } from 'react';
import classNames from 'classnames';

// --- Types & Interfaces ---
type MainTabType = 'pickup' | 'create_label';
type SubTabType = 'pending_pickup' | 'picked_up';

interface DashboardStat {
  label: string;
  value: string | number; // Trong thiết kế gốc là width, nhưng thực tế nên là giá trị
  minWidth?: string; // Giữ lại property width từ thiết kế để tham khảo responsive
}

// --- Constants ---
// Mô phỏng dữ liệu thống kê từ thiết kế
const STATS_DATA: DashboardStat[] = [
  { label: "Ngày Lấy hàng", value: "Hôm nay", minWidth: "120px" },
  { label: "Đơn vị vận chuyển", value: "Tất cả", minWidth: "140px" },
  { label: "Đơn lấy dự kiến", value: 120, minWidth: "120px" },
  { label: "Lấy hàng thành công", value: 45, minWidth: "160px" },
  { label: "Số đơn chờ lấy hàng", value: 75, minWidth: "160px" },
];

// --- Sub-Components (Tách nhỏ để tối ưu render) ---

// 1. Main Tab Item (Lấy hàng, Tạo phiếu)
const MainTabItem = memo(({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={classNames(
      "h-12 px-2 flex items-center justify-center transition-all duration-200 border-b-[5px] text-xl font-medium whitespace-nowrap",
      {
        "border-[#E78720] text-[#E78720] font-medium": isActive,
        "border-transparent text-[#081F24] hover:text-[#E78720]/70 font-normal": !isActive,
      }
    )}
  >
    {label}
  </button>
));

// 2. Sub Tab Button (Chờ lấy hàng, Đã lấy hàng)
const SubTabButton = memo(({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={classNames(
      "h-12 min-w-[144px] px-6 flex items-center justify-center border rounded-sm transition-all duration-200 text-lg whitespace-nowrap",
      {
        "bg-white border-[#D9D9D9] text-[#E78720] font-medium shadow-sm": isActive,
        "bg-[#D9D9D9]/50 border-[#D9D9D9] text-[#081F24] font-light hover:bg-[#D9D9D9]/70": !isActive,
      }
    )}
  >
    {label}
  </button>
));

// 3. Stat Column Item
const StatItem = memo(({ label, minWidth }: { label: string; minWidth?: string }) => (
  <div 
    className="flex flex-col justify-center text-base md:text-md text-[#081F24] font-light whitespace-nowrap"
    style={{ minWidth: minWidth || 'auto' }}
  >
    {label}
  </div>
));

// --- Main Component ---
const SellerDeliveryDashboard = () => {
  // State management
  const [mainTab, setMainTab] = useState<MainTabType>('pickup');
  const [subTab, setSubTab] = useState<SubTabType>('pending_pickup');

  return (
    <div className="w-full max-w-[1440px] mx-auto bg-white min-h-[calc(100vh-80px)] flex flex-col gap-6 p-5 md:p-10 font-sans">
      
      {/* Section 1: Main Tabs (Lấy hàng / Tạo phiếu) */}
      <div className="w-full border-b border-[#D9D9D9] flex items-center gap-8 overflow-x-auto scrollbar-hide">
        <MainTabItem 
          label="Lấy hàng" 
          isActive={mainTab === 'pickup'} 
          onClick={() => setMainTab('pickup')} 
        />
        <MainTabItem 
          label="Tạo phiếu" 
          isActive={mainTab === 'create_label'} 
          onClick={() => setMainTab('create_label')} 
        />
      </div>

      {/* Section 2: Sub Tabs (Chờ lấy hàng / Đã lấy hàng) */}
      {mainTab === 'pickup' && (
        <div className="w-full border-b border-[#D9D9D9] pb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <SubTabButton 
            label="Chờ lấy hàng" 
            isActive={subTab === 'pending_pickup'} 
            onClick={() => setSubTab('pending_pickup')} 
          />
          <SubTabButton 
            label="Đã Lấy Hàng" 
            isActive={subTab === 'picked_up'} 
            onClick={() => setSubTab('picked_up')} 
          />
        </div>
      )}

      {/* Section 3: Data Dashboard / Filter Bar */}
      <div className="w-full flex flex-col gap-3 border border-[#D9D9D9] rounded-sm bg-white overflow-hidden shadow-sm">
        {/* Header Row (Gray Background) */}
        <div className="w-full h-[60px] bg-[#F6F6F6] border-b border-[#D9D9D9] px-5 flex items-center gap-8 md:gap-16 lg:gap-[130px] overflow-x-auto custom-scrollbar">
          {STATS_DATA.map((stat, index) => (
            <StatItem 
              key={index} 
              label={stat.label} 
              minWidth={stat.minWidth} 
            />
          ))}
        </div>

        {/* Content Placeholder (Nơi hiển thị danh sách đơn hàng) */}
        <div className="p-8 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
           <p>Danh sách đơn hàng sẽ hiển thị ở đây...</p>
           {/* Bạn có thể nhúng OrderTable hoặc BulkActionPanel vào đây sau */}
        </div>
      </div>
      
    </div>
  );
};

export default SellerDeliveryDashboard;