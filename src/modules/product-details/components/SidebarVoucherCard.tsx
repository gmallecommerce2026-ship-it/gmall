"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { VoucherService } from "@/services/voucher.service";

interface SidebarVoucherCardProps {
  voucher: any;
}

const SidebarVoucherCard: React.FC<SidebarVoucherCardProps> = ({ voucher }) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  // Hàm format tiền tệ
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Xử lý text giảm giá
  const discountText = voucher.discountType === "PERCENTAGE"
    ? `Giảm ${voucher.discountValue}%`
    : `Giảm ${formatCurrency(Number(voucher.discountValue))}`;

  // Xử lý điều kiện
  const minOrderText = voucher.minOrderPrice && Number(voucher.minOrderPrice) > 0
    ? `Đơn tối thiểu ${formatCurrency(Number(voucher.minOrderPrice))}`
    : "Cho mọi đơn hàng";

  // #8: wire button "Lưu" voucher.
  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await VoucherService.claimVoucher(voucher.code);
      setSaved(true);
      toast.success(`Đã lưu mã ${voucher.code}!`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể lưu mã";
      // BE thường trả 401 nếu chưa login → AxiosClient interceptor sẽ tự redirect /login,
      // ở đây chỉ cần báo lỗi cho user khi mã đã claim hoặc đã hết.
      toast.error(typeof msg === "string" ? msg : "Không thể lưu mã");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative group flex flex-col bg-orange-50/40 border border-orange-200 rounded-lg p-3 transition-all hover:border-brand-orange hover:shadow-sm">
      
      {/* Hàng trên: Icon + Mã + Nút Lưu */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center text-brand-orange shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
               <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.633-.73l-1.738-5.42-3.954-1.582V17a1 1 0 01-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
             </svg>
           </div>
           <span className="font-mono font-bold text-xs text-brand-orange bg-orange-100 px-2 py-0.5 rounded border border-orange-200 border-dashed">
             {voucher.code}
           </span>
        </div>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={saved || saving}
          className={`text-xs font-semibold px-2 py-1 rounded transition-colors border ${
            saved
              ? "bg-green-100 text-green-700 border-green-200 cursor-default"
              : "text-brand-orange hover:bg-brand-orange hover:text-white border-transparent hover:border-brand-orange disabled:opacity-50"
          }`}
        >
          {saved ? "Đã lưu" : saving ? "..." : "Lưu"}
        </button>
      </div>

      {/* Hàng dưới: Thông tin chi tiết */}
      <div className="pl-1">
        <p className="text-sm font-bold text-gray-800 leading-tight mb-0.5">
          {discountText}
        </p>
        <p className="text-[11px] text-gray-500">
          {minOrderText}
        </p>
        <div className="mt-1.5 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
             {/* Thanh progress giả lập thời gian còn lại (hoặc số lượng) */}
            <div className="h-full bg-brand-orange w-3/4 opacity-60"></div>
        </div>
      </div>

      {/* Trang trí lỗ đục lỗ coupon */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-r border-orange-200"></div>
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-l border-orange-200"></div>
    </div>
  );
};

export default SidebarVoucherCard;