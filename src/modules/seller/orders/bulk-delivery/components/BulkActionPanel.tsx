// src/modules/seller/orders/bulk-delivery/components/BulkActionPanel.tsx
// Wire 3 bulk action: sửa địa chỉ / đổi ngày lấy hàng / yêu cầu ĐVVC.
// audit 0053 Seller #1, #2 — wiki 0060.
'use client';

import React, { useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-hot-toast';
import { FiChevronDown, FiMapPin, FiTruck, FiBox, FiCalendar, FiEdit2, FiLoader } from 'react-icons/fi';
import { GhnBulkService, BulkUpdateAddressItem } from '@/services/ghn-bulk.service';

interface SelectedOrder {
  id: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  shippingOrderCode?: string | null;
}

interface Props {
  selectedCount: number;
  selectedOrders?: SelectedOrder[];
  onAfterAction?: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export const BulkActionPanel = ({ selectedCount = 0, selectedOrders = [], onAfterAction }: Props) => {
  const [method, setMethod] = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate, setPickupDate] = useState<string>(todayISO());
  const [submitting, setSubmitting] = useState<null | 'pickup' | 'date' | 'address'>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const requirePickGuard = (): boolean => {
    if (selectedCount === 0) {
      toast.error('Vui lòng chọn ít nhất 1 đơn hàng');
      return false;
    }
    return true;
  };

  // 1. YÊU CẦU ĐVVC ĐẾN LẤY HÀNG
  const handleRequestPickup = async () => {
    if (!requirePickGuard()) return;
    setSubmitting('pickup');
    try {
      const orderIds = selectedOrders.map(o => o.id);
      const res = await GhnBulkService.requestPickup(orderIds);
      const r = (res as any)?.data || res;
      if (r.successCount > 0) {
        toast.success(`Đã tạo phiếu ${r.successCount}/${orderIds.length} đơn`);
      }
      if (r.failCount > 0) {
        const sampleFail = r.results?.find((x: any) => !x.ok);
        toast.error(`${r.failCount} đơn thất bại: ${sampleFail?.message || ''}`);
      }
      onAfterAction?.();
    } catch (e: any) {
      const raw = e?.response?.data?.message;
      toast.error(Array.isArray(raw) ? raw.join('\n') : (raw || e?.message || 'Yêu cầu thất bại'));
    } finally {
      setSubmitting(null);
    }
  };

  // 2. ĐỔI NGÀY LẤY HÀNG
  const handleChangePickupDate = async () => {
    if (!requirePickGuard()) return;
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (new Date(pickupDate) <= todayMidnight) {
      toast.error('Vui lòng chọn ngày trong tương lai');
      return;
    }
    setSubmitting('date');
    try {
      const orderIds = selectedOrders.map(o => o.id);
      // BE expect ISO date string với time
      const isoDate = `${pickupDate}T08:00:00.000Z`;
      const res = await GhnBulkService.changePickupDate(orderIds, isoDate);
      const r = (res as any)?.data || res;
      if (r.successCount > 0) toast.success(`Đổi ngày thành công ${r.successCount}/${orderIds.length}`);
      if (r.failCount > 0) {
        const sampleFail = r.results?.find((x: any) => !x.ok);
        toast.error(`${r.failCount} đơn thất bại: ${sampleFail?.message || ''}`);
      }
      onAfterAction?.();
    } catch (e: any) {
      const raw = e?.response?.data?.message;
      toast.error(Array.isArray(raw) ? raw.join('\n') : (raw || e?.message || 'Đổi ngày thất bại'));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="w-[340px] flex-shrink-0 bg-white border-l border-gray-200 h-[calc(100vh-80px)] sticky top-[80px] overflow-y-auto p-6 flex flex-col gap-6 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Chuẩn bị hàng loạt</h2>
        <p className="text-gray-500 font-light text-sm">
          {selectedCount} kiện hàng được chọn
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg p-5 flex flex-col gap-5 bg-white">

        <div className="flex bg-gray-100 p-1 rounded-full relative">
            <button
                onClick={() => setMethod('pickup')}
                className={classNames(
                    "flex-1 py-3 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                    method === 'pickup' ? "bg-white text-[#E78720] shadow-md" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <FiTruck /> Pickup
            </button>
            <button
                onClick={() => setMethod('dropoff')}
                className={classNames(
                    "flex-1 py-3 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                    method === 'dropoff' ? "bg-white text-[#E78720] shadow-md" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <FiBox /> Drop off
            </button>
        </div>

        {method === 'pickup' ? (
            <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-light">Địa chỉ giao của đơn được chọn</span>
                    <button
                      onClick={() => {
                        if (!requirePickGuard()) return;
                        setShowAddressModal(true);
                      }}
                      className="text-[#2D80E2] font-medium hover:underline flex items-center gap-1"
                    >
                      <FiEdit2 size={12} /> Sửa
                    </button>
                </div>

                <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 min-h-[60px]">
                    {selectedOrders.length === 0 ? (
                      <div className="text-xs text-gray-400">Chưa chọn đơn nào</div>
                    ) : selectedOrders.length === 1 ? (
                      <>
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {selectedOrders[0].recipientName || '-'} - {selectedOrders[0].recipientPhone || '-'}
                        </div>
                        <div className="text-gray-500 text-xs flex gap-2 items-start mt-2">
                            <FiMapPin className="mt-0.5 flex-shrink-0 text-[#E78720]" />
                            <span className="line-clamp-2">{selectedOrders[0].recipientAddress || '-'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-600">
                        {selectedOrders.length} đơn — bấm "Sửa" để cập nhật từng đơn hoặc đồng loạt.
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FiCalendar /> Ngày lấy hàng
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      min={todayISO()}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E78720] rounded-lg bg-white text-[#E78720] font-medium focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <button
                      onClick={handleChangePickupDate}
                      disabled={submitting !== null}
                      className="w-full px-4 py-2 text-sm border border-[#E78720] text-[#E78720] rounded-lg hover:bg-orange-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting === 'date' && <FiLoader className="animate-spin" />}
                      Cập nhật ngày lấy ({selectedCount})
                    </button>
                </div>

                <button
                  onClick={handleRequestPickup}
                  disabled={submitting !== null || selectedCount === 0}
                  className="w-full bg-[#E78720] hover:bg-[#d17515] text-white font-bold py-3.5 px-4 rounded-full shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting === 'pickup' && <FiLoader className="animate-spin" />}
                  Yêu cầu ĐVVC đến lấy hàng
                </button>
            </div>
        ) : (
             <div className="flex flex-col gap-4 py-4 animate-fadeIn">
                 <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                     Vui lòng mang hàng ra bưu cục gần nhất để gửi.
                 </div>
                 <button className="w-full bg-[#E78720] hover:bg-[#d17515] text-white font-bold py-3.5 px-4 rounded-full shadow-lg transition-all active:scale-95">
                    Xác nhận gửi hàng tại bưu cục
                </button>
             </div>
        )}
      </div>

      {showAddressModal && (
        <BulkAddressModal
          orders={selectedOrders}
          onClose={() => setShowAddressModal(false)}
          onDone={() => {
            setShowAddressModal(false);
            onAfterAction?.();
          }}
        />
      )}
    </div>
  );
};

// ===== Modal sửa địa chỉ hàng loạt =====
// MVP: cho user nhập 1 địa chỉ áp dụng cho TẤT CẢ đơn đã chọn. Mỗi đơn cần
// đủ recipientAddress + districtId + wardCode (GHN format).
const BulkAddressModal: React.FC<{
  orders: SelectedOrder[];
  onClose: () => void;
  onDone: () => void;
}> = ({ orders, onClose, onDone }) => {
  const [address, setAddress] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!address.trim() || !districtId || !wardCode.trim()) {
      toast.error('Vui lòng nhập đủ Địa chỉ, District ID, Ward Code');
      return;
    }
    setSubmitting(true);
    try {
      const items: BulkUpdateAddressItem[] = orders.map(o => ({
        orderId: o.id,
        recipientAddress: address.trim(),
        districtId: Number(districtId),
        wardCode: wardCode.trim(),
        ...(recipientName.trim() ? { recipientName: recipientName.trim() } : {}),
        ...(recipientPhone.trim() ? { recipientPhone: recipientPhone.trim() } : {}),
      }));
      const res = await GhnBulkService.updateAddress(items);
      const r = (res as any)?.data || res;
      if (r.successCount > 0) toast.success(`Cập nhật ${r.successCount}/${orders.length} đơn`);
      if (r.failCount > 0) {
        const sampleFail = r.results?.find((x: any) => !x.ok);
        toast.error(`${r.failCount} đơn lỗi: ${sampleFail?.message || ''}`);
      }
      onDone();
    } catch (e: any) {
      const raw = e?.response?.data?.message;
      toast.error(Array.isArray(raw) ? raw.join('\n') : (raw || e?.message || 'Cập nhật thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-lg font-bold mb-1">Sửa địa chỉ {orders.length} đơn</h3>
        <p className="text-xs text-gray-500 mb-4">Áp dụng cho tất cả đơn đã chọn</p>

        <div className="space-y-3">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Địa chỉ đầy đủ (số nhà, đường, phường)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E78720]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              type="number"
              placeholder="District ID (GHN)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E78720]"
            />
            <input
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              placeholder="Ward Code (GHN)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E78720]"
            />
          </div>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Tên người nhận (để trống = giữ nguyên)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E78720]"
          />
          <input
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="SĐT người nhận (để trống = giữ nguyên)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E78720]"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-sm bg-[#E78720] text-white rounded-lg hover:bg-[#d17515] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <FiLoader className="animate-spin" />}
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};
