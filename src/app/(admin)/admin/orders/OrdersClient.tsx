'use client';

import React, { useEffect, useState } from 'react';
import { 
  FiSearch, FiFilter, FiDownload, FiEye, 
  FiAlertCircle, FiRefreshCw 
} from 'react-icons/fi';
import { AdminService, AdminOrder } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function OrdersClient() {
  // --- STATE ---
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // --- FETCH DATA ---
  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        page,
        limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: debouncedSearch,
      };

      const res: any = await AdminService.getAllOrders(params);

      if (res?.data) {
        setOrders(res.data);
        setTotalOrders(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Fetch Orders Error:', err);
      setError(true);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi filter/page thay đổi
  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, debouncedSearch]);

  // --- HELPERS ---
  const handleExport = () => {
    toast.success('Đang xuất báo cáo Excel... (Demo)');
  };

  // Badge Status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700' },
      SHIPPING: { label: 'Đang giao', className: 'bg-purple-100 text-purple-700' },
      DELIVERED: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
      RETURNED: { label: 'Trả hàng', className: 'bg-gray-100 text-gray-700' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-600' };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // --- RENDER ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500">
            Tổng số: <span className="font-semibold text-gray-900">{totalOrders}</span> đơn hàng
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FiDownload size={16} /> Xuất báo cáo
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Tìm theo Mã đơn, Tên, Email..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>

        <div className="relative min-w-[180px]">
          <select 
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <FiFilter className="absolute left-3 top-3 text-gray-400" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-gray-500">
            <FiRefreshCw className="animate-spin mb-3 text-blue-500" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-red-500">
            <FiAlertCircle size={32} className="mb-3" />
            <p>Lỗi kết nối máy chủ.</p>
            <button onClick={() => fetchOrders()} className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">Thử lại</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-gray-500">
            <p>Không tìm thấy đơn hàng nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                  <th className="p-4 border-b">Mã đơn</th>
                  <th className="p-4 border-b">Khách hàng</th>
                  <th className="p-4 border-b text-right">Tổng tiền</th>
                  <th className="p-4 border-b text-center">Trạng thái</th>
                  <th className="p-4 border-b">Ngày tạo</th>
                  <th className="p-4 border-b text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="p-4 font-mono font-medium text-blue-600">
                      #{order.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.recipientName || order.user?.name || 'Khách vãng lai'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200"
                        title="Xem chi tiết"
                        onClick={() => toast('Tính năng chi tiết đang phát triển')}
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <p className="text-sm text-gray-500">
            Hiển thị trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}