'use client';
import { useState, useEffect } from 'react';
import { VoucherService, Voucher } from '@/services/voucher.service';
import { useCheckoutStore } from '@/store/useCheckoutStore'; // Store lưu trạng thái checkout
import { apiClient } from '@/lib/api/ApiClient';

export default function CheckoutSummary({ items } : any) { // items từ cart
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]); // Lưu mã code
  const [orderPreview, setOrderPreview] = useState<any>(null); // Kết quả tính toán từ BE

  // 1. Lấy voucher trong ví của User
  useEffect(() => {
    VoucherService.getMyVouchers().then(setAvailableVouchers);
  }, []);

  // 2. Mỗi khi chọn voucher hoặc thay đổi items -> Gọi Preview
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data } = await apiClient.post('/orders/preview', {
          items: items, // Format theo DTO backend yêu cầu
          voucherIds: selectedVouchers,
          isBuyNow: false
        });
        setOrderPreview(data);
      } catch (error) {
        console.error("Lỗi tính tiền", error);
      }
    };

    if (items.length > 0) fetchPreview();
  }, [selectedVouchers, items]);

  // Handle chọn voucher
  const toggleVoucher = (code: string) => {
    setSelectedVouchers(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-4">Thanh toán</h3>

      {/* List Voucher để chọn (Giản lược) */}
      <div className="mb-4">
        <p className="font-medium mb-2">Voucher của bạn:</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableVouchers.map(v => (
            <div key={v.id} className="flex justify-between border p-2 rounded">
              <div>
                <span className="font-bold text-sm">{v.code}</span>
                <span className="text-xs text-gray-500 block">{v.name}</span>
              </div>
              <input 
                type="checkbox" 
                checked={selectedVouchers.includes(v.code)}
                onChange={() => toggleVoucher(v.code)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị giá tiền (Lấy từ Preview BE) */}
      <div className="space-y-2 text-sm border-t pt-2">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{orderPreview?.subtotal?.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Voucher giảm:</span>
          <span>-{orderPreview?.discounts?.voucher?.toLocaleString() || 0}đ</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Tổng cộng:</span>
          <span className="text-red-600">{orderPreview?.total?.toLocaleString()}đ</span>
        </div>
      </div>

      <button className="w-full bg-red-600 text-white py-3 mt-4 rounded font-bold">
        ĐẶT HÀNG
      </button>
    </div>
  );
}