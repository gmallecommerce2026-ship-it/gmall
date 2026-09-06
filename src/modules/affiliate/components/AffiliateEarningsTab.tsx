'use client';

/**
 * wiki 0105 — tab "Hoa hồng & Ví".
 *
 * Gộp sổ hoa hồng, ba con số dư và việc rút tiền vào một chỗ vì người dùng đọc chúng
 * theo đúng thứ tự đó: *kiếm được bao nhiêu → bao giờ rút được → rút*.
 *
 * Ba con số nhưng chỉ HAI trạng thái tiền: chưa rút được và rút được. Phần chưa rút
 * được tách làm hai dòng để trả lời câu hỏi "vì sao tôi chưa rút được" — chờ khách nhận
 * hàng, hay chờ kỳ chốt sổ.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Banknote, Clock, PiggyBank, Wallet } from 'lucide-react';
import {
  AffiliateService,
  type AffiliateBalance,
  type AffiliateCommission,
  type CommissionStatus,
} from '@/services/AffiliateService';

const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

const STATUS_LABEL: Record<CommissionStatus, { text: string; cls: string }> = {
  PENDING: { text: 'Chờ giao hàng', cls: 'bg-gray-100 text-gray-600' },
  APPROVED: { text: 'Tạm tính', cls: 'bg-amber-100 text-amber-700' },
  SETTLED: { text: 'Đã nhận', cls: 'bg-green-100 text-green-700' },
  CANCELLED: { text: 'Đơn đã huỷ', cls: 'bg-gray-100 text-gray-500' },
  REJECTED: { text: 'Bị từ chối', cls: 'bg-red-100 text-red-700' },
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ giao hàng' },
  { key: 'APPROVED', label: 'Tạm tính' },
  { key: 'SETTLED', label: 'Đã nhận' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
];

export default function AffiliateEarningsTab({ balance }: { balance?: AffiliateBalance }) {
  const [rows, setRows] = useState<AffiliateCommission[]>([]);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payouts, setPayouts] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const available = balance?.available ?? 0;

  const loadSide = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        AffiliateService.listPayouts(),
        AffiliateService.listSettlements(),
      ]);
      setPayouts(Array.isArray(p) ? p : []);
      setSettlements(Array.isArray(s) ? s : []);
    } catch {
      /* phần phụ — không chặn sổ hoa hồng */
    }
  }, []);

  useEffect(() => {
    void loadSide();
  }, [loadSide]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await AffiliateService.listCommissions({ status, page });
        if (cancelled) return;
        setRows(res?.data ?? []);
        setMeta({
          page: res?.meta?.page ?? 1,
          totalPages: res?.meta?.totalPages ?? 1,
          total: res?.meta?.total ?? 0,
        });
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Không tải được sổ hoa hồng.');
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, page]);

  const submitPayout = useCallback(async () => {
    const amt = Math.floor(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Số tiền rút không hợp lệ.');
      return;
    }
    if (amt > available) {
      toast.error('Số tiền rút vượt quá số dư khả dụng.');
      return;
    }
    if (!bankInfo.trim()) {
      toast.error('Vui lòng nhập thông tin ngân hàng nhận tiền.');
      return;
    }
    setSubmitting(true);
    try {
      await AffiliateService.requestPayout({ amount: amt, bankInfo: bankInfo.trim() });
      toast.success('Đã gửi yêu cầu rút tiền. Chờ quản trị viên duyệt nhé!');
      setAmount('');
      await loadSide();
    } catch (e: any) {
      toast.error(e?.message || 'Không gửi được yêu cầu rút tiền.');
    } finally {
      setSubmitting(false);
    }
  }, [amount, bankInfo, available, loadSide]);

  const cards = [
    {
      label: 'Chờ khách nhận hàng',
      value: balance?.waitingDelivery ?? 0,
      icon: Clock,
      tone: 'text-gray-500 bg-gray-100',
      hint: 'Đơn chưa giao xong, có thể bị huỷ',
    },
    {
      label: 'Tạm tính',
      value: balance?.provisional ?? 0,
      icon: PiggyBank,
      tone: 'text-amber-600 bg-amber-50',
      hint: 'Đã chắc, chờ tới kỳ chốt sổ hàng tháng',
    },
    {
      label: 'Khả dụng — rút được',
      value: available,
      icon: Wallet,
      tone: 'text-green-600 bg-green-50',
      hint: 'Hoa hồng đã chốt sổ, nằm trong ví',
    },
  ];

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg p-1.5 ${c.tone}`}>
                  <Icon size={16} />
                </span>
                <span className="text-xs font-medium text-gray-600">{c.label}</span>
              </div>
              <div className="mt-2 text-xl font-bold text-gray-800">{formatVnd(c.value)}đ</div>
              <div className="mt-0.5 text-xs text-gray-400">{c.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Rút tiền */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-gray-800">
            <Banknote size={18} className="text-green-500" /> Rút hoa hồng
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Chỉ rút được phần <span className="font-medium">khả dụng</span> — tức hoa hồng đã
            qua kỳ chốt sổ.
          </p>

          <label htmlFor="aff-amount" className="mb-1.5 block text-sm font-medium text-gray-700">
            Số tiền (đ)
          </label>
          <input
            id="aff-amount"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Tối đa ${formatVnd(available)}`}
            className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />

          <label htmlFor="aff-bank" className="mb-1.5 block text-sm font-medium text-gray-700">
            Tài khoản nhận tiền
          </label>
          <input
            id="aff-bank"
            type="text"
            value={bankInfo}
            onChange={(e) => setBankInfo(e.target.value)}
            placeholder="Vietcombank - 0123456789 - NGUYEN VAN A"
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />

          <button
            type="button"
            onClick={submitPayout}
            disabled={submitting || available <= 0}
            className="w-full rounded-lg bg-brand-orange py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Đang gửi…' : 'Gửi yêu cầu rút tiền'}
          </button>

          {payouts.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 text-sm font-semibold text-gray-700">Lịch sử rút</h4>
              <ul className="space-y-1.5 text-sm">
                {payouts.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-gray-600">
                    <span>{formatVnd(p.amount)}đ</span>
                    <span className="text-xs text-gray-400">
                      {p.status === 'PENDING'
                        ? 'Chờ duyệt'
                        : p.status === 'APPROVED'
                          ? 'Đã chuyển'
                          : 'Bị từ chối'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Các kỳ đã chốt */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-base font-bold text-gray-800">Các kỳ đã chốt sổ</h3>
          <p className="mb-4 text-sm text-gray-500">
            Hoa hồng được chốt theo tháng. Sau khi chốt, tiền vào ví và rút được.
          </p>
          {settlements.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có kỳ nào được chốt.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {settlements.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-medium text-gray-800">Kỳ {s.period}</div>
                    <div className="text-xs text-gray-400">{s.itemCount} khoản</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +{formatVnd(s.amount)}đ
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sổ hoa hồng */}
      <h3 className="mb-3 text-base font-bold text-gray-800">Sổ hoa hồng</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setStatus(f.key);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === f.key
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Đang tải…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          Chưa có khoản hoa hồng nào ở mục này.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium">Giá trị</th>
                  <th className="px-4 py-3 font-medium">%</th>
                  <th className="px-4 py-3 font-medium">Hoa hồng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((r) => {
                  const s = STATUS_LABEL[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="max-w-[240px] px-4 py-3">
                        <div className="line-clamp-1 text-gray-800">{r.product.name}</div>
                        <div className="text-xs text-gray-400">
                          Đơn #{r.orderId.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatVnd(r.baseAmount)}đ</td>
                      <td className="px-4 py-3 text-gray-600">{(r.rate * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatVnd(r.amount)}đ
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.cls}`}>
                          {s.text}
                        </span>
                        {r.rejectReason && (
                          <div className="mt-1 max-w-[200px] text-xs text-gray-400">
                            {r.rejectReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {meta.page}/{meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page >= meta.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
