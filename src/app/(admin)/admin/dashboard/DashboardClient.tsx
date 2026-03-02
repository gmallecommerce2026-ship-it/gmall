// src/app/(admin)/admin/dashboard/DashboardClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  FiUsers, FiShoppingBag, FiDollarSign, FiPackage, 
  FiArrowUp, FiArrowDown, FiActivity 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { AdminService } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils'; // Giả định bạn có utility này, hoặc dùng Intl.NumberFormat

// Component con: Thẻ thống kê
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
          <span className="ml-1 font-medium">{trendValue}</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Gọi API lấy thống kê tổng quan (Mock hoặc Real)
        // Nếu Backend chưa có, ta dùng dữ liệu giả lập tạm thời trong catch hoặc mock service
        const dashboardData = await AdminService.getDashboardStats(); 
        
        // 2. Gọi API lấy biểu đồ doanh thu
        const revenueRes = await AdminService.getRevenueStats('year');
        const safeStats = dashboardData || {
            totalRevenue: 150000000,
            totalOrders: 1250,
            totalUsers: 3400,
            activeShops: 120
        };
        setStats(safeStats);

        // Map data cho Recharts
        if (revenueRes?.chartData) {
            setRevenueData(revenueRes.chartData);
        } else {
            // Fallback data nếu API chưa sẵn sàng
            setRevenueData([
                { name: 'T1', value: 4000000 },
                { name: 'T2', value: 3000000 },
                { name: 'T3', value: 2000000 },
                { name: 'T4', value: 2780000 },
                { name: 'T5', value: 1890000 },
                { name: 'T6', value: 2390000 },
                { name: 'T7', value: 3490000 },
            ]);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu thống kê...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <div className="text-sm text-gray-500">Cập nhật lần cuối: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value={formatCurrency(stats.totalRevenue) || '150.000.000 ₫'} 
          icon={FiDollarSign} 
          color="bg-blue-500"
          trend="up" 
          trendValue="+12.5%" 
        />
        <StatCard 
          title="Đơn hàng mới" 
          value={stats.totalOrders || '1,250'} 
          icon={FiPackage} 
          color="bg-purple-500"
          trend="up" 
          trendValue="+5.2%" 
        />
        <StatCard 
          title="Người dùng" 
          value={stats.totalUsers || '3,400'} 
          icon={FiUsers} 
          color="bg-orange-500"
          trend="down" 
          trendValue="-2.1%" 
        />
        <StatCard 
          title="Cửa hàng hoạt động" 
          value={stats.activeShops || '120'} 
          icon={FiShoppingBag} 
          color="bg-green-500"
          trend="up" 
          trendValue="+8.4%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ tăng trưởng doanh thu</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hoạt động gần đây (Recent Activities) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {/* Mock Data cho List hoạt động */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="mt-1 p-2 bg-gray-100 rounded-full">
                   <FiActivity size={14} className="text-gray-600"/>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Đơn hàng #DH00{item} vừa được tạo</p>
                  <p className="text-xs text-gray-500">2 phút trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}