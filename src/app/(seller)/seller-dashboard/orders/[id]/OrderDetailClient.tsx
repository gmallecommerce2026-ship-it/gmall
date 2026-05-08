'use client';

/**
 * Seller order detail page (fix B7.6, B7.7).
 *
 * Trước đây <OrderTable> trong seller dashboard đã có button Eye link tới
 * `/seller-dashboard/orders/${order.id}` nhưng route này KHÔNG tồn tại ->
 * click = 404 (hoặc Next.js catch-all redirect về trang chủ). Đó là lý do
 * seller "không vào xem chi tiết đơn hàng được" (B7.6) và "chưa link với
 * đơn hàng đang mua" (B7.7).
 *
 * BE đã có endpoint `GET /orders/seller/:id` và service FE có method
 * `getSellerOrderDetail` — chỉ thiếu page này.
 */

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, Phone, User, Package } from 'lucide-react';
import { OrderService } from '@/services/order.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';

interface Props {
  id: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Chờ lấy hàng', color: 'bg-blue-100 text-blue-700' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function OrderDetailClient({ id }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await OrderService.getSellerOrderDetail(id);
      setOrder(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleAdvance = async (next: 'CONFIRMED' | 'SHIPPING') => {
    setActing(true);
    try {
      await OrderService.updateOrderStatus(id, next);
      toast.success('Cập nhật trạng thái thành công');
      await loadOrder();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-gray-500">
        Không tìm thấy đơn hàng.{' '}
        <Link href="/seller-dashboard/orders" className="text-brand-orange underline">
          Quay lại
        </Link>
      </div>
    );
  }

  const status = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/seller-dashboard/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-orange mb-4"
      >
        <ArrowLeft size={16} /> Danh sách đơn hàng
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Đơn hàng <span className="font-mono text-brand-orange">#{order.id.slice(0, 8).toUpperCase()}</span>
          </h1>
          <p className="text-sm text-gray-500">
            Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${status.color}`}>
          {status.label}
        </span>
      </header>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        {/* Items + status */}
        <section className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} /> Sản phẩm ({order.items?.length || 0})
            </h2>
            <ul className="divide-y">
              {order.items?.map((item: any) => (
                <li key={item.id} className="py-3 flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product?.images?.[0] || '/placeholder.png'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=No';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-clamp-2">
                      {item.product?.name || item.name}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500">Phân loại: {item.variantName}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {formatCurrency(Number(item.price))} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-brand-orange self-center whitespace-nowrap">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold mb-3">Thao tác</h3>
              <div className="flex gap-3">
                {order.status === 'PENDING' && (
                  <Button onClick={() => handleAdvance('CONFIRMED')} disabled={acting}>
                    Xác nhận đơn
                  </Button>
                )}
                {order.status === 'CONFIRMED' && (
                  <Button onClick={() => handleAdvance('SHIPPING')} disabled={acting}>
                    Giao ĐVVC
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Sidebar: customer + totals */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <User size={18} /> Khách hàng
            </h3>
            <p className="text-sm"><strong>{order.user?.name || order.recipientName}</strong></p>
            {(order.user?.phone || order.recipientPhone) && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone size={14} /> {order.user?.phone || order.recipientPhone}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MapPin size={18} /> Địa chỉ giao hàng
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {order.shippingAddress || order.recipientAddress || '—'}
            </p>
          </div>

          {order.isGift && order.message && (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-5">
              <h3 className="font-bold mb-2 text-orange-700">Đơn quà tặng</h3>
              <p className="text-sm italic text-gray-700">"{order.message}"</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính</span>
              <span>{formatCurrency(Number(order.subtotal || 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span>{formatCurrency(Number(order.shippingFee || 0))}</span>
            </div>
            {Number(order.voucherDiscount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Voucher</span>
                <span>-{formatCurrency(Number(order.voucherDiscount))}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold text-brand-orange text-base">
              <span>Tổng</span>
              <span>{formatCurrency(Number(order.total || 0))}</span>
            </div>
            <p className="text-xs text-gray-500 pt-1">
              Phương thức: <span className="uppercase font-semibold">{order.paymentMethod}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
