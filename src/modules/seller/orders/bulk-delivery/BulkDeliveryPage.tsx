// src/modules/seller/orders/bulk-delivery/BulkDeliveryPage.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { FiChevronRight, FiSearch, FiFilter, FiChevronDown, FiLoader } from 'react-icons/fi';
import { OrderFilterSection } from './components/OrderFilterSection';
import { BulkActionPanel } from './components/BulkActionPanel';
import { OrderService } from '@/services/order.service';

interface BulkDeliveryPageProps {
  isEmbedded?: boolean;
}

interface SellerOrder {
  id: string;
  code?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  status?: string;
  shippingOrderCode?: string | null;
  shippingProvider?: string;
  totalAmount?: number | string;
  createdAt?: string;
  items?: Array<{ product?: { name?: string; images?: any } }>;
}

const STATUS_TABS = [
  { id: 'pending', label: 'Chờ giao hàng', filter: 'CONFIRMED' },
  { id: 'create', label: 'Tạo phiếu', filter: 'PENDING' },
] as const;

const firstImage = (imgs: any) => {
  if (Array.isArray(imgs)) return imgs[0]?.url || imgs[0] || '';
  return imgs?.url || imgs || '';
};

const BulkDeliveryPage = ({ isEmbedded = false }: BulkDeliveryPageProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'create'>('pending');
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filterStatus = STATUS_TABS.find(t => t.id === activeTab)?.filter || 'CONFIRMED';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res: any = await OrderService.getSellerOrders(filterStatus);
      const list: SellerOrder[] = Array.isArray(res) ? res : (res?.data || res?.items || []);
      setOrders(list);
      // Reset selection khi đổi tab
      setSelectedIds(new Set());
    } catch (e) {
      console.error('[bulk-delivery] fetch error:', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(orders.map(o => o.id)) : new Set());
  };

  const selectedOrders = useMemo(() => orders.filter(o => selectedIds.has(o.id)), [orders, selectedIds]);
  const allChecked = orders.length > 0 && selectedIds.size === orders.length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 font-sans text-gray-900">

      {!isEmbedded && (
      <header className="bg-white shadow-sm sticky top-0 z-30 w-full px-8 h-[80px] flex items-center justify-between backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3 text-[15px] text-gray-500">
          <span className="hover:text-[#E78720] cursor-pointer transition-colors">Trang chủ</span>
          <FiChevronRight className="text-gray-400" />
          <span className="text-gray-900 font-medium">Giao hàng loạt</span>
        </div>
        <div className="hidden md:flex items-center bg-gray-100 px-5 py-2.5 rounded-full w-[400px] border border-transparent focus-within:border-[#E78720] focus-within:bg-white transition-all">
             <FiSearch className="text-gray-400 mr-3 text-lg"/>
             <input type="text" placeholder="Tìm kiếm đơn hàng, mã vận đơn..." className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400" />
        </div>
      </header>
      )}

      <div className="flex flex-row items-start justify-center w-full max-w-[1920px] mx-auto">

        <main className="flex-1 flex flex-col gap-6 p-6 md:p-8 min-w-0 max-w-[1200px]">

          <h1 className="text-[32px] font-bold text-gray-900 leading-tight">Giao hàng loạt</h1>

          <div className="flex items-end border-b border-gray-200 w-full mt-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    "px-6 py-3 text-lg font-medium transition-all relative top-[1px] border-b-[4px]",
                    activeTab === tab.id
                      ? "text-[#E78720] border-[#E78720]"
                      : "text-gray-500 border-transparent hover:text-[#E78720] hover:border-gray-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          <OrderFilterSection />

          <div className="flex items-center justify-between mt-4">
             <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 text-[#2D80E2] font-medium hover:underline text-sm">
                    Mở rộng bộ lọc <FiChevronDown />
                 </button>
                 <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
                 <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FiFilter />
                    <span>Sắp xếp theo: Hạn gửi hàng (Xa - Gần nhất)</span>
                    <FiChevronDown className="cursor-pointer" />
                 </div>
             </div>
             <div className="text-xl font-light text-gray-900">
                 <span className="font-medium">{orders.length}</span> kiện hàng
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px] flex flex-col mt-2">
             <div className="bg-gray-50 border-b border-gray-200 p-4 grid grid-cols-[40px_1fr_140px_160px_140px_140px] gap-4 items-center text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#E78720] focus:ring-[#E78720] cursor-pointer"
                />
                <span>Sản phẩm</span>
                <span>Mã đơn hàng</span>
                <span>Người mua</span>
                <span>Mã vận đơn</span>
                <span>Trạng thái</span>
             </div>

             {loading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 py-20">
                  <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="font-light">Đang tải đơn hàng...</span>
               </div>
             ) : orders.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center shadow-inner">
                      <FiSearch className="w-8 h-8 text-gray-300" />
                  </div>
                  <span className="font-light">Không tìm thấy đơn hàng nào phù hợp</span>
               </div>
             ) : (
               <div className="divide-y divide-gray-100">
                 {orders.map(o => {
                   const firstItem = o.items?.[0];
                   const checked = selectedIds.has(o.id);
                   return (
                     <div
                       key={o.id}
                       className={classNames(
                         'p-4 grid grid-cols-[40px_1fr_140px_160px_140px_140px] gap-4 items-center text-sm hover:bg-gray-50 transition-colors cursor-pointer',
                         checked && 'bg-orange-50/40',
                       )}
                       onClick={() => toggleOne(o.id)}
                     >
                       <input
                         type="checkbox"
                         checked={checked}
                         onChange={() => toggleOne(o.id)}
                         onClick={(e) => e.stopPropagation()}
                         className="w-5 h-5 rounded border-gray-300 text-[#E78720] focus:ring-[#E78720] cursor-pointer"
                       />
                       <div className="flex gap-3 items-center min-w-0">
                         {firstItem?.product?.images && (
                           <img
                             src={firstImage(firstItem.product.images) || '/placeholder.png'}
                             alt=""
                             className="w-10 h-10 rounded-md object-cover bg-gray-50 flex-shrink-0"
                             onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                           />
                         )}
                         <span className="line-clamp-1 text-gray-800">{firstItem?.product?.name || '(không tên)'}</span>
                       </div>
                       <span className="text-xs text-gray-500 truncate">{o.code || o.id.slice(0, 8)}</span>
                       <span className="text-gray-700">{o.recipientName || '-'}</span>
                       <span className="text-xs text-gray-500">{o.shippingOrderCode || '-'}</span>
                       <span className="text-xs">
                         {o.shippingOrderCode
                           ? <span className="text-green-600 font-medium">Đã có phiếu</span>
                           : <span className="text-orange-600 font-medium">Chưa có phiếu</span>}
                       </span>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </main>

        <BulkActionPanel
          selectedCount={selectedIds.size}
          selectedOrders={selectedOrders}
          onAfterAction={fetchOrders}
        />

      </div>
    </div>
  );
};

export default BulkDeliveryPage;
