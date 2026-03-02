'use client';
import { useState } from 'react';
import { VoucherService } from '@/services/voucher.service';
import { toast } from 'react-hot-toast';

interface Props {
  vouchers: any[]; // List voucher fetch được từ server component hoặc API
}

export default function ProductVouchers({ vouchers = [] }: Props) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleClaim = async (code: string, id: string) => {
    setLoadingIds(prev => [...prev, id]);
    try {
      await VoucherService.claimVoucher(code);
      toast.success('Lưu voucher thành công!');
      // Có thể reload lại list voucher user đã lưu để update UI disable nút
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi lưu voucher');
    } finally {
      setLoadingIds(prev => prev.filter(item => item !== id));
    }
  };

  if (!vouchers.length) return null;

  return (
    <div className="bg-orange-50 p-3 rounded-md mb-4 border border-orange-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-600 font-bold text-sm">Mã giảm giá của Shop:</span>
      </div>
      <div className="flex flex-wrap gap-2">
          {vouchers.map((v) => {
            // [FIX] Tính toán an toàn
            const amountValue = Number(v.amount); 
            const minOrder = Number(v.minOrderValue);
            const displayDiscount = v.type === 'PERCENTAGE' 
              ? `Giảm ${amountValue}%` 
              : `Giảm ${amountValue / 1000}k`;
              
            return (
              <div key={v.id} className="relative flex items-center bg-white border border-orange-200 rounded shadow-sm px-3 py-1.5">
                <div className="border-r border-dashed border-gray-300 pr-3 mr-3">
                  <span className="text-xs font-bold text-orange-600 block">
                    {displayDiscount}
                  </span>
                  <span className="text-[10px] text-gray-500">Đơn từ {minOrder / 1000}k</span>
                </div>
                <button
                  onClick={() => handleClaim(v.code, v.id)}
                  disabled={loadingIds.includes(v.id)}
                  className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 disabled:bg-gray-400"
                >
                  {loadingIds.includes(v.id) ? '...' : 'Lưu'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}