'use client'; // Bắt buộc vì dùng hooks
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShopService } from '@/services/shop.service';
import { formatCurrency } from '@/lib/utils'; // Giả sử bạn có hàm này, nếu chưa thì dùng hàm dưới

// Fallback format function nếu chưa có utils
const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

interface DashboardStats {
    revenue: number;
    orders: number;
    products: number;
    rating: number;
    lowStockProducts: number;
    todo: {
        pending: number;
        shipping: number;
        returned: number;
    };
    chart: { date: string; revenue: number }[];
}

const SellerOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data: any = await ShopService.getSellerDashboardStats();
        if (data) {
            setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
      return <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
  }

  // Tính max revenue để scale biểu đồ
  const maxRevenue = stats?.chart ? Math.max(...stats.chart.map(d => d.revenue)) : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan cửa hàng</h1>
          <p className="text-sm text-gray-500">Chào mừng trở lại! Dưới đây là tình hình kinh doanh hôm nay.</p>
        </div>
        <Link 
            href="/seller-dashboard/products/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
        >
            <span className="text-lg">+</span> Thêm sản phẩm
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Doanh thu" 
          value={formatVND(stats?.revenue || 0)} 
          subText="Tổng doanh thu tích lũy"
          icon={<DollarIcon />}
          color="blue"
        />
        <StatCard 
          title="Đơn hàng" 
          value={stats?.orders || 0} 
          subText="Đơn hàng thành công"
          icon={<ShoppingBagIcon />}
          color="purple"
        />
        <StatCard 
          title="Sản phẩm" 
          value={stats?.products || 0} 
          subText="Đang kinh doanh"
          icon={<BoxIcon />}
          color="orange"
        />
        <StatCard 
          title="Đánh giá Shop" 
          value={`${stats?.rating || 5.0}/5.0`} 
          subText="Uy tín cửa hàng"
          icon={<StarIcon />}
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Biểu đồ doanh thu (7 ngày qua)</h3>
          </div>
          
          {/* Dynamic Chart */}
          <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-gray-100 pb-2">
             {stats?.chart?.map((item, i) => {
                // Tính chiều cao cột (%) dựa trên maxRevenue. Tránh chia cho 0.
                const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                // Đảm bảo cột có chiều cao tối thiểu để hiển thị tooltip nếu = 0
                const displayHeight = heightPercent === 0 ? 2 : heightPercent;

                return (
                    <div key={i} className="w-full relative group flex flex-col justify-end items-center h-full">
                        {/* Tooltip giá trị */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-800 text-white text-xs rounded py-1 px-2 transition-opacity z-10 whitespace-nowrap">
                            {formatVND(item.revenue)}
                        </div>
                        
                        {/* Cột biểu đồ */}
                        <div className="w-full bg-blue-50 rounded-t-sm relative h-full flex items-end overflow-hidden group hover:bg-blue-100 transition-colors cursor-pointer">
                             <div 
                                style={{ height: `${displayHeight}%` }} 
                                className={`w-full rounded-t-md transition-all duration-500 ease-out ${item.revenue > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-gray-200'}`}
                            ></div>
                        </div>
                        
                        {/* Nhãn ngày */}
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-2 font-medium">{item.date}</div>
                    </div>
                )
             })}
          </div>
        </div>

        {/* Todo List / Pending Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">Việc cần xử lý</h3>
          <div className="space-y-3">
             <TodoItem 
                label="Chờ xác nhận" 
                count={stats?.todo.pending || 0} 
                href="/seller-dashboard/orders?tab=pending" 
                // urgent={stats?.todo.pending > 0} 
             />
             <TodoItem 
                label="Chờ lấy hàng" 
                count={stats?.todo.shipping || 0} 
                href="/seller-dashboard/orders?tab=shipping" 
                // urgent={stats?.todo.shipping > 0}
             />
             <TodoItem 
                label="Đơn hủy / Hoàn tiền" 
                count={stats?.todo.returned || 0} 
                href="/seller-dashboard/orders?tab=returned" 
                color="red"
             />
             <TodoItem 
                label="Sản phẩm sắp hết hàng" 
                count={stats?.lowStockProducts || 0} 
                href="/seller-dashboard/products/all?stock=low" 
                color="orange"
                // urgent={stats?.lowStockProducts > 0}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, icon, color, subText }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-800 break-all">{value}</h4>
                    {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
                </div>
                <div className={`p-3 rounded-lg flex-shrink-0 ${colorClasses[color] || 'bg-gray-50'}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const TodoItem = ({ label, count, href, urgent, color }: any) => {
    const isUrgent = urgent || (color === 'red' && count > 0);
    const badgeColor = isUrgent ? 'bg-red-100 text-red-600' : (color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600');

    return (
        <Link href={href} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
            <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">{label}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>
                {count}
            </span>
        </Link>
    );
};

// --- Icons (SVG) ---
const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const ShoppingBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);
const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

export default SellerOverview;