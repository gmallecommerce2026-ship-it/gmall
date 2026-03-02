'use client';
import { useEffect, useState } from 'react';
import { VoucherService, Voucher } from '@/services/voucher.service';

export default function MyVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    VoucherService.getMyVouchers().then(setVouchers).catch(console.error);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Kho Voucher Của Tôi</h2>
      
      {vouchers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Bạn chưa lưu voucher nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v) => (
            <div key={v.id} className="border rounded-lg p-4 flex justify-between items-center">
               <div>
                  <p className="font-bold text-lg">{v.code}</p>
                  <p className="text-sm text-gray-600">{v.name}</p>
                  <p className="text-xs text-gray-400">HSD: {new Date(v.endDate).toLocaleDateString()}</p>
               </div>
               <div className="text-red-500 font-bold">
                  x{1} {/* Số lượng */}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}