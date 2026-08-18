'use client';

// wiki 0108 — màn Ví & rút tiền của người bán.
//
// Ràng buộc lấy thẳng từ `FinanceService.requestPayout` của backend, để giao diện chặn
// TRƯỚC khi gửi thay vì để người dùng ăn lỗi 400:
//   - số tiền phải > 0 và là số nguyên (BE làm `Math.floor`)
//   - không được vượt số dư (BE trả "Số dư ví không đủ")
//   - bắt buộc có thông tin ngân hàng nhận tiền
// Tiền bị TRỪ NGAY khi gửi yêu cầu (escrow), nên phải nói rõ điều đó cho người bán biết.

import React, { useCallback, useEffect, useState } from 'react';
import { Wallet, ArrowDownToLine, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { SellerFinanceService, type PayoutRequest } from '@/services/seller-finance.service';

const vnd = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;

const STATUS_META: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  APPROVED: { label: 'Đã chuyển', cls: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle2 },
  REJECTED: { label: 'Bị từ chối', cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
};

export default function FinanceClient() {
  const [balance, setBalance] = useState<number | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, p] = await Promise.all([
        SellerFinanceService.getWallet(),
        SellerFinanceService.getPayouts(),
      ]);
      setBalance(w.walletBalance);
      setPayouts(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    const amt = Math.floor(Number(String(amount).replace(/[^\d]/g, '')));
    if (!amt || amt <= 0) {
      setError('Vui lòng nhập số tiền muốn rút.');
      return;
    }
    if (balance !== null && amt > balance) {
      setError(`Số dư không đủ. Bạn đang có ${vnd(balance)}.`);
      return;
    }
    if (!bankInfo.trim()) {
      setError('Vui lòng nhập thông tin ngân hàng nhận tiền.');
      return;
    }

    setSubmitting(true);
    try {
      await SellerFinanceService.requestPayout(amt, bankInfo.trim());
      setOk(`Đã gửi yêu cầu rút ${vnd(amt)}. Số tiền này được giữ lại ngay và sẽ chuyển sau khi quản trị duyệt.`);
      setAmount('');
      setBankInfo('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Không gửi được yêu cầu rút tiền, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài chính</h1>
          <p className="text-gray-500 mt-1 text-sm">Số dư ví, yêu cầu rút tiền và lịch sử rút.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm flex items-center gap-2 hover:border-brand-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Tải lại
        </button>
      </div>

      <div className="bg-gradient-to-br from-brand-orange to-orange-400 rounded-xl p-6 text-white shadow-lg max-w-sm">
        <div className="flex items-center justify-between">
          <p className="text-white/90 font-medium">Số dư khả dụng</p>
          <Wallet size={22} className="opacity-80" />
        </div>
        <p className="text-3xl font-bold mt-2">{loading || balance === null ? '…' : vnd(balance)}</p>
        <p className="text-xs text-white/80 mt-2">Đã trừ phí sàn 5% trên mỗi đơn giao thành công.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <ArrowDownToLine size={18} /> Yêu cầu rút tiền
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Số tiền muốn rút</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ví dụ: 500000"
              className="h-11 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:border-brand-orange"
            />
            {balance !== null && (
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                className="text-xs text-brand-orange hover:underline self-start"
              >
                Rút toàn bộ {vnd(balance)}
              </button>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Ngân hàng nhận tiền</span>
            <input
              value={bankInfo}
              onChange={(e) => setBankInfo(e.target.value)}
              maxLength={191}
              placeholder="Vietcombank - 0123456789 - NGUYEN VAN A"
              className="h-11 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:border-brand-orange"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-green-700">{ok}</p>}

        <p className="text-xs text-gray-500">
          Số tiền được giữ lại khỏi ví ngay khi bạn gửi yêu cầu, và chỉ hoàn lại nếu quản trị từ chối.
        </p>

        <button
          type="submit"
          disabled={submitting || loading}
          className="h-11 px-6 rounded-lg bg-brand-orange text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Đang gửi…' : 'Gửi yêu cầu rút tiền'}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-900">Lịch sử rút tiền</div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải…</div>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Bạn chưa có yêu cầu rút tiền nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Ngày gửi</th>
                <th className="text-right px-6 py-3 font-medium">Số tiền</th>
                <th className="text-left px-6 py-3 font-medium">Ngân hàng</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((p) => {
                const meta = STATUS_META[p.status] || {
                  label: p.status,
                  cls: 'bg-gray-50 text-gray-600 border-gray-200',
                  Icon: Clock,
                };
                const { Icon } = meta;
                return (
                  <tr key={p.id}>
                    <td className="px-6 py-3 text-gray-600">
                      {p.requestedAt ? new Date(p.requestedAt).toLocaleString('vi-VN') : '—'}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">{vnd(p.amount)}</td>
                    <td className="px-6 py-3 text-gray-600">{p.bankInfo}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.cls}`}>
                        <Icon size={13} /> {meta.label}
                      </span>
                      {p.status === 'REJECTED' && p.reason && (
                        <span className="block text-xs text-gray-500 mt-1">Lý do: {p.reason}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
