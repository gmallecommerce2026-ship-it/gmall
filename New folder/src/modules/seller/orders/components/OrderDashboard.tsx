import React from 'react';
import FilterTab from './FilterTab';
import OrderStatusSummary from './OrderStatusSummary';

// Dữ liệu mẫu giả lập từ data1, data2, data3 trong code cũ
const SHIPPING_TABS = [
  "Tất cả", "Giao hàng loạt", "Bàn Giao Đơn Hàng", 
  "Đơn Trả hàng/Hoàn tiền hoặc Đơn hủy", "Cài Đặt Vận Chuyển"
];

const ORDER_STATS = [
  { title: "Tổng lượt đánh giá", value: 0, growth: 0, isCurrency: false },
  { title: "Đơn hàng", value: 0, growth: 0, isCurrency: false },
  { title: "Số lượng đã bán", value: 0, growth: 0, isCurrency: false },
  { title: "Doanh thu", value: "0", growth: 0, isCurrency: true }, // Thêm trường hợp tiền tệ
];

const OrderDashboard = () => {
  const [activeTab, setActiveTab] = React.useState("Tất cả");

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="bg-white w-full shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
           <span>Trang chủ</span> 
           <span>&gt;</span> 
           <span className="text-black font-medium">Giao hàng loạt</span>
        </div>
        
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium text-gray-900">Quản Lý Đơn Hàng</h1>
            {/* Các nút action phụ nếu cần */}
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-4 mt-6 border-b border-gray-200">
          {SHIPPING_TABS.map((tab) => (
            <FilterTab 
              key={tab} 
              label={tab} 
              isActive={activeTab === tab} 
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="bg-white w-full shadow-sm rounded-lg flex flex-row overflow-x-auto">
        {ORDER_STATS.map((stat, index) => (
          <OrderStatusSummary
            key={index}
            title={stat.title}
            value={stat.value}
            growthRate={stat.growth}
            isCurrency={stat.isCurrency}
          />
        ))}
      </div>

      {/* Dashboard Body Placeholder */}
      <div className="bg-white shadow-sm rounded-lg p-6 h-[500px] flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
        Khu vực hiển thị danh sách đơn hàng (DataGrid)
      </div>
    </div>
  );
};

export default OrderDashboard;