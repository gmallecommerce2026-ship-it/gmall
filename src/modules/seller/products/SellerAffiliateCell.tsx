'use client';

/**
 * wiki 0105 — ô bật/tắt tiếp thị liên kết trong bảng sản phẩm của seller.
 *
 * Mặc định MỌI sản phẩm đều TẮT vì hoa hồng TRỪ THẲNG vào doanh thu của chính seller.
 * Vì thế ô này phải nói rõ hệ quả bằng TIỀN chứ không chỉ bằng phần trăm — seller đang
 * bật một thứ lấy tiền của họ, không được để họ phát hiện điều đó qua sao kê.
 *
 * Nhập theo PHẦN TRĂM (8), gửi đi dạng THẬP PHÂN (0.08) — BE nhận thập phân.
 */

import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, Loader2, Megaphone, X } from 'lucide-react';
import { ProductService } from '@/services/product.service';

const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

/** Trần mặc định, khớp `AFFILIATE_MAX_RATE` bên BE. BE vẫn là nơi chốt cuối. */
const MAX_PERCENT = 30;

export default function SellerAffiliateCell({
  productId,
  price,
  enabled,
  rate,
}: {
  productId: string;
  price: number;
  enabled?: boolean;
  rate?: number | null;
}) {
  const [on, setOn] = useState(!!enabled);
  const [percent, setPercent] = useState(rate ? String(+(rate * 100).toFixed(2)) : '5');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (nextOn: boolean) => {
      const p = Number(percent);
      if (nextOn) {
        if (!Number.isFinite(p) || p <= 0) {
          toast.error('% hoa hồng phải lớn hơn 0.');
          return;
        }
        if (p > MAX_PERCENT) {
          toast.error(`% hoa hồng tối đa là ${MAX_PERCENT}%.`);
          return;
        }
      }
      setSaving(true);
      try {
        await ProductService.updateAffiliate(productId, {
          enabled: nextOn,
          // Làm tròn 4 chữ số vì cột DB là Decimal(6,4); gửi 0.083333… sẽ bị cắt ngầm
          // và số hiện lại khác số vừa nhập.
          rate: nextOn ? Number((p / 100).toFixed(4)) : undefined,
        });
        setOn(nextOn);
        setEditing(false);
        toast.success(nextOn ? `Đã bật tiếp thị ${p}%` : 'Đã tắt tiếp thị liên kết');
      } catch (e: any) {
        // Hiện NGUYÊN VĂN lý do từ BE (vượt trần, không phải SP của mình…).
        toast.error(e?.response?.data?.message || e?.message || 'Không lưu được.');
      } finally {
        setSaving(false);
      }
    },
    [percent, productId],
  );

  const commission = Math.floor((price || 0) * (Number(percent) / 100 || 0));

  // `stopPropagation` ở mọi thao tác: hàng của bảng có onClick chọn dòng, không chặn thì
  // mỗi lần gõ số lại tick/bỏ tick checkbox của hàng.
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  if (!on && !editing) {
    return (
      <div onClick={stop}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-orange-400 hover:text-orange-600"
        >
          <Megaphone size={13} /> Bật tiếp thị
        </button>
      </div>
    );
  }

  if (on && !editing) {
    return (
      <div onClick={stop} className="space-y-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
          <Check size={12} /> {percent}% · {formatVnd(commission)}đ
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 underline hover:text-gray-700"
          >
            Sửa
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="text-xs text-red-500 underline hover:text-red-700 disabled:opacity-50"
          >
            Tắt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={stop} className="w-[190px] space-y-2">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={MAX_PERCENT}
          step="0.5"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          aria-label="Phần trăm hoa hồng"
          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none"
        />
        <span className="text-sm text-gray-500">%</span>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(true)}
          className="rounded-md bg-brand-orange px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Huỷ"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
        >
          <X size={14} />
        </button>
      </div>

      {/* Nói bằng TIỀN, không chỉ bằng %. Đây là tiền RA khỏi túi seller. */}
      <p className="text-[11px] leading-snug text-gray-500">
        Bạn trả <span className="font-semibold text-gray-700">{formatVnd(commission)}đ</span>/sản
        phẩm bán qua link, trừ vào doanh thu khi đơn giao thành công. Tối đa {MAX_PERCENT}%.
      </p>
    </div>
  );
}
