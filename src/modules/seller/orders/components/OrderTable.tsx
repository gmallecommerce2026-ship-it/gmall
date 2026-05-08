'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { OrderService } from '@/services/order.service';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { PackageCheck, Truck, Eye, Loader2, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Thêm prop searchQuery
const OrderTable = ({ status, searchQuery }: { status: string, searchQuery?: string }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Logic mapping status: 'all' gửi lên là undefined để BE hiểu là lấy tất cả
      const statusParam = status === 'all' ? undefined : status;
      // Giả sử API getSellerOrders hỗ trợ param search, nếu chưa thì cần lọc client hoặc update API
      const res: any = await OrderService.getSellerOrders(statusParam);
      let rawData = Array.isArray(res) ? res : (res?.data || []);

      if (searchQuery && Array.isArray(rawData)) {
        const lowerQ = searchQuery.toLowerCase();
        rawData = rawData.filter((o: any) =>
          o.id?.toLowerCase().includes(lowerQ) ||
          o.user?.name?.toLowerCase().includes(lowerQ) ||
          o.user?.phone?.includes(searchQuery)
        );
      }

      setOrders(rawData);
    } catch (error) {
      console.error("Load orders error:", error);
      toast.error("Lỗi tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, searchQuery]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleUpdate = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await OrderService.updateOrderStatus(orderId, nextStatus);
      toast.success(`Cập nhật trạng thái: ${nextStatus} thành công!`);
      await loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
      <span className="text-gray-500 text-sm">Đang đồng bộ dữ liệu...</span>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-semibold border-y border-gray-100">
          <tr>
            <th className="px-4 py-3 w-[40%]">Sản phẩm</th>
            <th className="px-4 py-3">Tổng đơn</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.length > 0 ? orders.map((order) => (
            <tr key={order.id} className="group hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase font-bold">
                      {order.paymentMethod}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                       <img 
                        src={order.items[0]?.product?.images?.[0] || '/placeholder.png'} 
                        className="w-full h-full object-cover" 
                        alt="product"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=No+Image'; }}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-sm text-gray-800 font-medium line-clamp-1 max-w-[250px]" title={order.items[0]?.product?.name}>
                        {order.items[0]?.product?.name}
                      </span>
                      {order.items.length > 1 && (
                        <span className="text-xs text-brand-orange font-medium">
                          + {order.items.length - 1} sản phẩm khác
                        </span>
                      )}
                      <span className="text-xs text-gray-500 mt-0.5">
                        Khách: {order.user?.name} - {order.user?.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4 font-bold text-gray-900">
                {formatCurrency(Number(order.totalAmount))}
              </td>
              
              <td className="px-4 py-4">
                <StatusBadge status={order.status} />
              </td>
              
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {/* Action Buttons Logic */}
                  {order.status === 'PENDING' && (
                    <ActionBtn 
                      icon={<PackageCheck size={14} />}
                      label="Xác nhận"
                      onClick={() => handleUpdate(order.id, 'CONFIRMED')}
                      loading={updatingId === order.id}
                      variant="primary"
                    />
                  )}
                  
                  {order.status === 'CONFIRMED' && (
                    <ActionBtn 
                      icon={<Truck size={14} />}
                      label="Giao ĐVVC"
                      onClick={() => handleUpdate(order.id, 'SHIPPING')}
                      loading={updatingId === order.id}
                      variant="primary"
                    />
                  )}

                  {/* View Details Button */}
                  <Link href={`/seller-dashboard/orders/${order.id}`}>
                    <Button variant="outline" className="!h-8 !px-3 !text-[11px] border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300">
                      <Eye size={14} />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <PackageCheck className="w-10 h-10 mb-2 opacity-20" />
                  <span>Không tìm thấy đơn hàng nào</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Sub-components để code gọn hơn
const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-100',
    SHIPPING: 'bg-purple-50 text-purple-700 border-purple-100',
    DELIVERED: 'bg-green-50 text-green-700 border-green-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
  };
  
  const labels: any = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Chờ lấy hàng',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
};

const ActionBtn = ({ icon, label, onClick, loading, variant }: any) => (
  <Button 
    disabled={loading}
    onClick={onClick}
    className={`!h-8 !px-3 !text-[11px] shadow-sm flex items-center gap-1.5 ${
      variant === 'primary' ? 'bg-brand-orange hover:bg-orange-600 text-white' : ''
    }`}
  >
    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
    <span>{label}</span>
  </Button>
);

export default OrderTable;