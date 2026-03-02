'use client';

import { useEffect, useState } from 'react';
import { VoucherService, Voucher } from '@/services/voucher.service';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function PromotionsClient() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await VoucherService.getSellerVouchers();
      setVouchers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kênh Marketing</h1>
        <Link 
          href="/seller-dashboard/promotions/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Tạo Voucher Mới
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Mã Voucher</th>
              <th className="p-4">Tên chương trình</th>
              <th className="p-4">Giảm giá</th>
              <th className="p-4">Đơn tối thiểu</th>
              <th className="p-4">Đã dùng</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center">Đang tải...</td></tr>
            ) : vouchers.length === 0 ? (
               <tr><td colSpan={7} className="p-4 text-center">Chưa có voucher nào</td></tr>
            ) : vouchers.map((v) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold text-blue-600">{v.code}</td>
                <td className="p-4">{v.name}</td>
                <td className="p-4">
                  {v.type === 'PERCENTAGE' ? `${v.amount}%` : `${v.amount.toLocaleString()}đ`}
                </td>
                <td className="p-4">{v.minOrderValue.toLocaleString()}đ</td>
                <td className="p-4 text-gray-600">{v.usageCount} / {v.usageLimit}</td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {v.isActive ? 'Đang chạy' : 'Tạm dừng'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}