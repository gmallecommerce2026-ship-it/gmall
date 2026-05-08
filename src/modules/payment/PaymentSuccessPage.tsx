"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTracking, EventType } from '@/hooks/useTracking';
import { OrderService } from '@/services/order.service';
import Button from '@/components/ui/Button'; // Đảm bảo đường dẫn đúng
import { toast } from 'react-hot-toast'; // Cần cài react-hot-toast nếu chưa có

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

const getProductImage = (images: any): string => {
  if (Array.isArray(images) && images.length > 0) return images[0];
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : images;
    } catch { return images; }
  }
  return '/images/placeholder.png';
};

// --- MAIN COMPONENT ---
// TS-fix wiki 0031: nhận optional `orderCode` để client wrapper truyền orderId từ query param
interface PaymentSuccessPageProps {
  orderCode?: string;
}
const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = (_props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track } = useTracking();
  
  // Lấy danh sách ID từ URL (hỗ trợ ?orderIds=id1,id2)
  const orderIdsRaw = searchParams.get('orderIds');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasTracked, setHasTracked] = useState(false);

  // 1. Fetch dữ liệu
  useEffect(() => {
    const fetchOrders = async () => {
      if (!orderIdsRaw) {
        setLoading(false);
        return;
      }

      const ids = orderIdsRaw.split(',').filter(id => id.trim() !== '');
      try {
        setLoading(true);
        // Gọi song song để lấy chi tiết tất cả đơn hàng
        const results = await Promise.all(ids.map(id => OrderService.getOrderDetail(id)));
        setOrders(results);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderIdsRaw]);

  // 2. Tracking (Chỉ chạy 1 lần khi có data)
  useEffect(() => {
    if (!loading && orders.length > 0 && !hasTracked) {
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const allItems = orders.flatMap(o => o.items.map((i: any) => i.product.name));
      
      track(EventType.PURCHASE, orders.map(o => o.id).join(','), { 
          revenue: totalRevenue, 
          items: allItems,
          orderCount: orders.length
      });
      setHasTracked(true);
    }
  }, [loading, orders, hasTracked, track]);

  // 3. Tính toán tổng hợp (Grand Total)
  const summary = useMemo(() => {
    return orders.reduce((acc, order) => {
      const subTotal = order.items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);
      return {
        totalAmount: acc.totalAmount + Number(order.totalAmount),
        totalShipping: acc.totalShipping + Number(order.shippingFee),
        subTotal: acc.subTotal + subTotal,
        count: acc.count + 1
      };
    }, { totalAmount: 0, totalShipping: 0, subTotal: 0, count: 0 });
  }, [orders]);

  const totalDiscount = Math.max(0, (summary.subTotal + summary.totalShipping) - summary.totalAmount);

  // --- RENDER LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-b-orange-300 rounded-full animate-spin-slow"></div>
        </div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Đang xử lý đơn hàng...</p>
      </div>
    );
  }

  // --- RENDER ERROR ---
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-500 mb-6">Có thể đơn hàng chưa được tạo hoặc link không hợp lệ.</p>
            <Button onClick={() => router.push('/')} className="w-full">Về trang chủ</Button>
        </div>
      </div>
    );
  }

  // --- RENDER SUCCESS ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      {/* 1. HERO SECTION: Lời chúc & Tổng quan */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
            {/* Animated Checkmark */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 animate-bounce-slow">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-500 text-lg">Cảm ơn bạn đã tin tưởng mua sắm tại G-Mall</p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push('/')} variant="outline" className="px-8 border-gray-300 hover:bg-gray-50">
                    Tiếp tục mua sắm
                </Button>
                <Button onClick={() => router.push('/user/purchase')} className="px-8 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200">
                    Xem đơn hàng của tôi
                </Button>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid gap-8 lg:grid-cols-3">
        
        {/* 2. CỘT TRÁI: CHI TIẾT TỪNG ĐƠN HÀNG (DO TÁCH SHOP) */}
        <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Chi tiết đơn hàng ({orders.length})
            </h3>

            {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header Shop */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-gray-800">{order.shop?.name || 'Cửa hàng'}</p>
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                                     <span>Mã đơn: #{order.id.slice(0, 8).toUpperCase()}</span>
                                     <button 
                                        onClick={() => { navigator.clipboard.writeText(order.id); toast.success('Đã copy mã đơn'); }}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                     >(Sao chép)</button>
                                 </div>
                             </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {order.status === 'PENDING' ? 'Chờ xác nhận' : order.status}
                        </span>
                    </div>

                    {/* List sản phẩm */}
                    <div className="divide-y divide-gray-50">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="p-4 flex gap-4">
                                <div className="w-16 h-16 border border-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    <img src={getProductImage(item.product.images)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                        <p className="text-sm font-bold text-gray-800">{formatCurrency(item.price)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Order */}
                    <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">Vận chuyển: <b className="text-gray-700">{order.shippingProvider || 'Tiêu chuẩn'}</b></span>
                        <div className="flex items-center gap-2">
                             <span>Thành tiền:</span>
                             <span className="text-base font-bold text-orange-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* 3. CỘT PHẢI: TỔNG HỢP & THÔNG TIN NHẬN HÀNG */}
        <div className="space-y-6">
            
            {/* Box Thông tin nhận hàng (Lấy từ đơn đầu tiên vì giống nhau) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                 <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Thông tin nhận hàng
                 </h4>
                 <div className="text-sm space-y-3">
                     <div>
                         <p className="text-gray-500 text-xs uppercase font-semibold">Người nhận</p>
                         <p className="font-medium text-gray-900">{orders[0].recipientName}</p>
                         <p className="text-gray-600">{orders[0].recipientPhone}</p>
                     </div>
                     <div>
                         <p className="text-gray-500 text-xs uppercase font-semibold">Địa chỉ</p>
                         <p className="text-gray-700 leading-relaxed">{orders[0].recipientAddress}</p>
                     </div>
                     <div>
                         <p className="text-gray-500 text-xs uppercase font-semibold">Phương thức thanh toán</p>
                         <p className="font-medium text-blue-600">
                             {orders[0].paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : orders[0].paymentMethod}
                         </p>
                     </div>
                 </div>
            </div>

            {/* Box Tổng thanh toán */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Tổng thanh toán
                </h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Tổng tiền hàng ({summary.count} đơn):</span>
                        <span>{formatCurrency(summary.subTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển:</span>
                        <span>{formatCurrency(summary.totalShipping)}</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Đã tiết kiệm:</span>
                            <span>-{formatCurrency(totalDiscount)}</span>
                        </div>
                    )}
                    <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalAmount)}</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;