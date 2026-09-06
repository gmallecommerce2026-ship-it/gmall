// src/app/(admin)/admin/dashboard/DashboardClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Wiki 0104 (đợt 2): BỎ toàn bộ số liệu giả lập.
      //
      // Bản cũ khi API không trả dữ liệu thì hiện `totalRevenue: 150.000.000đ`,
      // `1.250 đơn`, `3.400 người dùng`, `120 cửa hàng`, kèm một **biểu đồ doanh thu
      // 7 tháng hư cấu** (T1–T7). Đây là màn hình đầu tiên người quản trị nhìn thấy và
      // là nơi họ đọc để đánh giá tình hình kinh doanh — một con số bịa ở đây tệ hơn
      // hẳn một ô trống. Cùng nguyên tắc đã áp cho `admin/finance/payouts`.
      try {
        setLoading(true);
        setLoadError(null);

        const dashboardData = await AdminService.getDashboardStats();
        const revenueRes = await AdminService.getRevenueStats('year');

        if (dashboardData && typeof dashboardData === 'object') {
          setStats(dashboardData);
        } else {
          setStats(null);
          setLoadError('Chưa lấy được số liệu tổng quan từ máy chủ.');
        }

        // Map data cho Recharts — không có dữ liệu thì để trống, KHÔNG vẽ đường giả
        setRevenueData(Array.isArray(revenueRes?.chartData) ? revenueRes.chartData : []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setStats(null);
        setRevenueData([]);
        setLoadError('Không tải được dữ liệu thống kê. Vui lòng thử lại.');
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

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">{loadError}</p>
          <p className="mt-1 text-red-600/80">
            Các ô số liệu để trống là có chủ đích — hệ thống không hiển thị con số phỏng đoán
            trên màn hình dùng để đánh giá kinh doanh.
          </p>
        </div>
      )}

      {/* Grid Stats
          Wiki 0104 (đợt 2): bỏ hai thứ bịa ở tầng hiển thị.
          (1) Giá trị dự phòng viết cứng (`stats.totalOrders || '1,250'`) — tầng fetch đã
              không còn dữ liệu giả, nên ở đây cũng không được "đắp" thêm.
          (2) Phần trăm tăng trưởng viết cứng (`+12.5%`, `-2.1%`…) — chúng hiện ra BẤT KỂ
              số liệu thật, nên người quản trị đọc "+12,5%" sẽ tin doanh thu tăng thật.
              API hiện chưa trả dữ liệu xu hướng ⇒ không truyền `trend`, `StatCard` tự ẩn. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={stats?.totalRevenue != null ? formatCurrency(stats.totalRevenue) : '—'}
          icon={FiDollarSign}
          color="bg-blue-500"
        />
        {/* wiki 0108: thẻ này trước ghi "Đơn hàng mới" nhưng đổ vào `totalOrders` —
            tức ĐẾM TẤT CẢ đơn từ trước tới nay (prod: 262), trong khi 30 ngày gần nhất
            chỉ 17. BE nay trả thêm `newOrders30d`; dùng đúng nó và nói rõ khoảng thời
            gian trên nhãn. Nếu BE chưa kịp deploy thì lùi về tổng và đổi luôn nhãn cho
            khớp, chứ không hiển thị số tổng dưới cái tên "mới". */}
        <StatCard
          title={stats?.newOrders30d != null ? 'Đơn hàng mới (30 ngày)' : 'Tổng đơn hàng'}
          value={stats?.newOrders30d ?? (stats?.totalOrders != null ? stats.totalOrders : '—')}
          icon={FiPackage}
          color="bg-purple-500"
        />
        <StatCard
          title="Người dùng"
          value={stats?.totalUsers != null ? stats.totalUsers : '—'}
          icon={FiUsers}
          color="bg-orange-500"
        />
        <StatCard
          title="Cửa hàng hoạt động"
          value={stats?.activeShops != null ? stats.activeShops : '—'}
          icon={FiShoppingBag}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ tăng trưởng doanh thu</h3>
          <div className="h-[300px] w-full">
            {revenueData.length === 0 ? (
              // Wiki 0104 (đợt 2): trước đây chỗ này vẽ một đường doanh thu 7 tháng HƯ CẤU
              // khi API chưa trả dữ liệu. Biểu đồ giả nguy hiểm hơn ô trống vì nó trông
              // hoàn toàn thuyết phục.
              <div className="flex h-full flex-col items-center justify-center text-center">
                <FiActivity className="mb-2 text-3xl text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Chưa có dữ liệu doanh thu</p>
                <p className="mt-1 text-xs text-gray-400">
                  Biểu đồ sẽ hiển thị khi máy chủ trả về số liệu theo thời gian.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Hoạt động gần đây (Recent Activities)
            Wiki 0104 (đợt 2): trước đây render `[1,2,3,4,5].map(...)` ra 5 dòng BỊA —
            "Đơn hàng #DH001 vừa được tạo · 2 phút trước" — trông y như một dòng thời gian
            thật đang chạy. Backend chưa có endpoint nhật ký hoạt động, nên nói thẳng là
            chưa có thay vì dựng một dòng thời gian không tồn tại. */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động gần đây</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FiActivity className="mb-2 text-2xl text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Chưa có nhật ký hoạt động</p>
            <p className="mt-1 text-xs text-gray-400">
              Cần bổ sung endpoint nhật ký ở máy chủ để hiển thị mục này.
            </p>
            <Link
              href="/admin/orders"
              className="mt-3 text-xs font-medium text-[#E78720] hover:underline"
            >
              Xem danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}