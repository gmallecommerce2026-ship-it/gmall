'use client';

/**
 * wiki 0105 — màn duyệt hồ sơ tiếp thị + đối soát hoa hồng cho admin.
 *
 * NGUYÊN TẮC BẮT BUỘC của màn hình này (bài học 🔴 wiki 0104): API lỗi thì HIỆN LỖI,
 * tuyệt đối không đổ dữ liệu mẫu. Đây là màn hình admin ra quyết định — duyệt người,
 * chi tiền — nên một con số bịa ở đây có hậu quả thật.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AdminService } from '@/services/AdminService';
// wiki 0111: báo cho menu quản trị cập nhật số việc đang chờ ngay sau khi xử lý,
// vì trang này xử lý tại chỗ và KHÔNG điều hướng đi đâu cả.
import { notifyPendingCountsChanged } from '@/lib/admin/pendingCounts';

const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

const ACCOUNT_FILTERS = [
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đang hoạt động' },
  { key: 'REJECTED', label: 'Đã từ chối' },
  { key: 'SUSPENDED', label: 'Đình chỉ' },
  { key: 'ALL', label: 'Tất cả' },
];

interface AccountRow {
  id: string;
  userId: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  code: string;
  status: string;
  channel: string | null;
  note: string | null;
  rejectReason: string | null;
  createdAt: string;
}

export default function AdminAffiliatePage() {
  const [tab, setTab] = useState<'accounts' | 'commissions'>('accounts');

  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const [commissions, setCommissions] = useState<any[]>([]);
  const [commMeta, setCommMeta] = useState<{ total: number; totalAmount: number } | null>(null);
  const [commError, setCommError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await AdminService.listAffiliateAccounts(status, 1);
      setRows(res?.data ?? []);
    } catch (e: any) {
      // Hiện lỗi thật, danh sách để TRỐNG. Không bịa hồ sơ.
      setError(e?.message || 'Không tải được danh sách hồ sơ tiếp thị.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const loadCommissions = useCallback(async () => {
    setCommError(null);
    try {
      const res: any = await AdminService.listAffiliateCommissions('ALL', 1);
      setCommissions(res?.data ?? []);
      setCommMeta({
        total: res?.meta?.total ?? 0,
        totalAmount: res?.meta?.totalAmount ?? 0,
      });
    } catch (e: any) {
      setCommError(e?.message || 'Không tải được dữ liệu đối soát.');
      setCommissions([]);
      setCommMeta(null);
    }
  }, []);

  useEffect(() => {
    if (tab === 'accounts') void loadAccounts();
    else void loadCommissions();
  }, [tab, loadAccounts, loadCommissions]);

  const review = useCallback(
    async (id: string, next: 'APPROVED' | 'REJECTED' | 'SUSPENDED', rejectReason?: string) => {
      setBusyId(id);
      try {
        await AdminService.reviewAffiliateAccount(id, { status: next, rejectReason });
        notifyPendingCountsChanged();
        toast.success(
          next === 'APPROVED' ? 'Đã duyệt hồ sơ.' : next === 'REJECTED' ? 'Đã từ chối.' : 'Đã đình chỉ.',
        );
        setRejectingId(null);
        setReason('');
        await loadAccounts();
      } catch (e: any) {
        toast.error(e?.message || 'Thao tác thất bại.');
      } finally {
        setBusyId(null);
      }
    },
    [loadAccounts],
  );

  const settle = useCallback(async () => {
    setSettling(true);
    try {
      const res: any = await AdminService.settleAffiliateNow();
      // Cố ý KHÔNG báo cập nhật badge ở đây: chốt sổ chuyển hoa hồng sang trạng thái đã
      // chi, nó không đụng tới hàng đợi "hồ sơ chờ duyệt" nào cả — gọi thêm ở đây chỉ tốn
      // một lượt API mà không đổi con số nào.
      toast.success(
        `Đã chốt kỳ ${res?.period ?? ''}: ${res?.accounts ?? 0} người, ${formatVnd(res?.total ?? 0)}đ`,
      );
      await loadCommissions();
    } catch (e: any) {
      toast.error(e?.message || 'Chốt sổ thất bại.');
    } finally {
      setSettling(false);
    }
  }, [loadCommissions]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-800">Tiếp thị liên kết</h1>

      <div className="mb-6 flex gap-1 border-b border-gray-200" role="tablist">
        {[
          { key: 'accounts' as const, label: 'Hồ sơ người tiếp thị' },
          { key: 'commissions' as const, label: 'Đối soát hoa hồng' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {ACCOUNT_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatus(f.key)}
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
              <div className="font-semibold">Không tải được dữ liệu</div>
              <div className="mt-1">{error}</div>
              <button
                type="button"
                onClick={loadAccounts}
                className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium hover:bg-red-100"
              >
                Thử lại
              </button>
            </div>
          ) : loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
              Không có hồ sơ nào ở trạng thái này.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((a) => (
                <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800">
                        {a.name || a.email || a.userId.slice(0, 8)}
                      </div>
                      <div className="mt-0.5 text-sm text-gray-500">
                        {a.email} {a.phone ? `· ${a.phone}` : ''}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Mã {a.code} · Kênh: {a.channel || 'không khai'}
                      </div>
                      {a.note && (
                        <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                          {a.note}
                        </div>
                      )}
                      {a.rejectReason && (
                        <div className="mt-2 text-sm text-red-600">Lý do: {a.rejectReason}</div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {a.status !== 'APPROVED' && (
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => review(a.id, 'APPROVED')}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                      )}
                      {a.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => setRejectingId(rejectingId === a.id ? null : a.id)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      )}
                      {a.status === 'APPROVED' && (
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => setRejectingId(rejectingId === a.id ? null : a.id)}
                          className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Đình chỉ
                        </button>
                      )}
                    </div>
                  </div>

                  {rejectingId === a.id && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      {/* Lý do BẮT BUỘC — khớp với luật ở BE. Không nêu lý do thì người
                          dùng không biết sửa gì, và hỗ trợ không có căn cứ trả lời. */}
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Lý do (bắt buộc)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Ví dụ: kênh chia sẻ không hợp lệ"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!reason.trim() || busyId === a.id}
                          onClick={() =>
                            review(a.id, a.status === 'APPROVED' ? 'SUSPENDED' : 'REJECTED', reason.trim())
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Xác nhận
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'commissions' && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              {commMeta ? (
                <>
                  {formatVnd(commMeta.total)} khoản · tổng{' '}
                  <span className="font-semibold text-gray-800">
                    {formatVnd(commMeta.totalAmount)}đ
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
            <button
              type="button"
              onClick={settle}
              disabled={settling}
              className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {settling ? 'Đang chốt…' : 'Chốt sổ kỳ gần nhất'}
            </button>
          </div>

          <p className="mb-4 text-xs text-gray-500">
            Chốt sổ chạy tự động hằng tháng. Nút này là đường dự phòng khi tác vụ nền gặp
            sự cố — bấm nhiều lần không cộng tiền nhiều lần.
          </p>

          {commError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {commError}
            </div>
          ) : commissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
              Chưa có khoản hoa hồng nào.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Người tiếp thị</th>
                    <th className="px-4 py-3 font-medium">Đơn</th>
                    <th className="px-4 py-3 font-medium">Gốc</th>
                    <th className="px-4 py-3 font-medium">%</th>
                    <th className="px-4 py-3 font-medium">Hoa hồng</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {commissions.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{c.affiliate?.name || c.affiliate?.email || '—'}</div>
                        <div className="text-xs text-gray-400">{c.affiliate?.code}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">#{String(c.orderId).slice(0, 8)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatVnd(c.baseAmount)}đ</td>
                      <td className="px-4 py-3 text-gray-600">{(c.rate * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatVnd(c.amount)}đ
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
