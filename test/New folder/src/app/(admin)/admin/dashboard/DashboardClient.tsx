// src/app/(admin)/dashboard/page.tsx
import React from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

// Component con hiển thị thẻ thống kê
const StatCard = ({ title, value, subtext, icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${subtext.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
        {subtext} <span className="text-gray-400 font-normal">so với tháng trước</span>
      </p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass} text-white shadow-sm`}>
      {icon}
    </div>
  </div>
);

export default function DashboardClient() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">Chào mừng trở lại! Đây là báo cáo hôm nay.</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
          Cập nhật lần cuối: 14/12/2025
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value="12.5 Tỷ ₫" 
          subtext="+15.3%" 
          icon={<FiDollarSign size={24} />}
          colorClass="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard 
          title="Đơn Hàng Mới" 
          value="1,245" 
          subtext="+8.2%" 
          icon={<FiShoppingBag size={24} />}
          colorClass="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard 
          title="Người Dùng Mới" 
          value="350" 
          subtext="-2.1%" 
          icon={<FiUsers size={24} />}
          colorClass="bg-gradient-to-br from-purple-400 to-purple-600"
        />
        <StatCard 
          title="Cửa Hàng Mới" 
          value="12" 
          subtext="+4.5%" 
          icon={<FiTrendingUp size={24} />}
          colorClass="bg-gradient-to-br from-[#E78720] to-[#FFB05C]"
        />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Chart Area Placeholder) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ tăng trưởng</h3>
          <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-200 text-gray-400">
            Biểu đồ doanh thu (Chart.js / Recharts) sẽ hiển thị ở đây
          </div>
        </div>

        {/* Right Column (Recent Activities) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#E78720]"></div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Cửa hàng "Gift Shop HCM" vừa đăng ký.</p>
                  <p className="text-xs text-gray-400">2 phút trước</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[#E78720] font-medium hover:bg-orange-50 rounded transition-colors">
            Xem tất cả nhật ký
          </button>
        </div>
      </div>
    </div>
  );
}