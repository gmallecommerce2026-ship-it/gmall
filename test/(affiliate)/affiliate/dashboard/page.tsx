import React from 'react';
import { DollarSign, MousePointer, ShoppingBag, Heart, Copy, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button'; // Sử dụng component Button có sẵn

export default function AffiliateDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hiệu suất</h1>
        <div className="text-sm text-gray-500">Cập nhật: 26/12/2025</div>
      </div>

      {/* 1. Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng Click" 
          value="1,240" 
          change="+12%" 
          icon={<MousePointer className="text-blue-500" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Đơn hàng" 
          value="85" 
          change="+5%" 
          icon={<ShoppingBag className="text-purple-500" />} 
          bg="bg-purple-50"
        />
        <StatCard 
          title="Hoa hồng dự kiến" 
          value="4.500.000₫" 
          change="+24%" 
          icon={<DollarSign className="text-green-500" />} 
          bg="bg-green-50"
        />
        <StatCard 
          title="Đã đóng góp quỹ" 
          value="500.000₫" 
          change="Tự động trích 10%" 
          icon={<Heart className="text-red-500" />} 
          bg="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Chart Section (Placeholder for Recharts/Chart.js) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Biểu đồ tăng trưởng</h3>
            <select className="border rounded-md text-sm p-1">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
            [Biểu đồ Line: Click vs Đơn hàng vs Hoa hồng]
          </div>
        </div>

        {/* 3. Quick Actions & Link */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Link giới thiệu mặc định</h3>
            <div className="flex gap-2">
              <input 
                readOnly 
                value="https://shop.com/?ref=user123" 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
              />
              <Button variant="outline"><Copy size={16}/></Button>
            </div>
          </div>
          
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
            <h4 className="font-medium text-primary-800 mb-1">Chiến dịch Giáng Sinh 🎄</h4>
            <p className="text-xs text-primary-600 mb-3">Hoa hồng +5% cho ngành hàng quà tặng.</p>
            <Button className="w-full">Tham gia ngay</Button>
          </div>

          <div className="flex justify-center">
             {/* QR Code Placeholder */}
             <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-xs">QR Code</div>
          </div>
        </div>
      </div>

      {/* 4. Recent Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Hiệu quả gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3">Link/Nguồn</th>
                <th className="px-6 py-3 text-center">Click</th>
                <th className="px-6 py-3 text-center">Đơn hàng</th>
                <th className="px-6 py-3 text-right">Hoa hồng</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1,2,3].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">26/12 10:30</td>
                  <td className="px-6 py-4 truncate max-w-[200px]">Giày sneaker nam...</td>
                  <td className="px-6 py-4 text-center">12</td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">50.000₫</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Chờ duyệt</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, change, icon, bg }: any) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <span className="text-xs font-medium text-green-600 mt-1 block">{change}</span>
    </div>
    <div className={`p-3 rounded-lg ${bg}`}>
      {icon}
    </div>
  </div>
);