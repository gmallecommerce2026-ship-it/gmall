// src/app/(admin)/admin/orders/page.tsx
import React from "react";
import Button from "@/components/ui/Button"; //
import { Search, Filter } from "lucide-react";

// Mock data (Thay thế bằng API call thực tế)
const orders = [
  { id: "#ORD-001", customer: "Nguyễn Văn A", seller: "Tech Shop", total: "1.200.000đ", status: "completed", date: "2023-12-14" },
  { id: "#ORD-002", customer: "Trần Thị B", seller: "Fashion Hub", total: "500.000đ", status: "pending", date: "2023-12-14" },
  { id: "#ORD-003", customer: "Lê Văn C", seller: "Tech Shop", total: "3.400.000đ", status: "shipping", date: "2023-12-13" },
];

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  shipping: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersClient() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 mt-1">Theo dõi tất cả đơn hàng trên hệ thống</p>
        </div>
        <div className="flex gap-3">
            <Button className="flex items-center gap-2">
                <Filter size={18} /> Bộ lọc
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Xuất báo cáo
            </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, khách hàng hoặc người bán..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-700">Mã đơn</th>
              <th className="px-6 py-4 font-medium text-gray-700">Khách hàng</th>
              <th className="px-6 py-4 font-medium text-gray-700">Người bán (Shop)</th>
              <th className="px-6 py-4 font-medium text-gray-700">Tổng tiền</th>
              <th className="px-6 py-4 font-medium text-gray-700">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-gray-700">Ngày đặt</th>
              <th className="px-6 py-4 font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">{order.seller}</td>
                <td className="px-6 py-4 font-medium">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{order.date}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}