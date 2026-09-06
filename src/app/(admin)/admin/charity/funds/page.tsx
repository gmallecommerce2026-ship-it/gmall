'use client';

/**
 * wiki 0110 — quản lý QUỸ từ thiện.
 *
 * Vì sao trang này ra đời: trang Chiến dịch quyên góp (`/admin/charity/campaigns`) khi
 * chưa có quỹ nào thì hiện đúng câu "Chưa có quỹ nào. Tạo quỹ trước ở trang Quản lý quỹ."
 * — nhưng **trang Quản lý quỹ chưa từng tồn tại**. BE đã mở sẵn `GET/POST /admin/charity/funds`
 * và `PATCH /admin/charity/funds/:id` từ lâu; chỉ thiếu màn hình. Tức admin đọc được lời
 * chỉ dẫn tới một nơi không có thật, và không có cách nào tạo quỹ.
 *
 * BE **không có** `DELETE funds/:id` (cố ý: quỹ đã nhận tiền quyên góp thì xoá là mất dấu
 * dòng tiền). Đóng quỹ = đổi trạng thái sang CLOSED.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiHeart, FiRefreshCw } from 'react-icons/fi';
import { apiClient } from '@/lib/api/ApiClient';

// Khớp enum `CharityFundStatus` của Prisma. Sai chữ là BE trả 400.
const STATUSES = [
  { key: 'ACTIVE', label: 'Đang nhận quyên góp', badge: 'bg-green-100 text-green-800' },
  { key: 'PAUSED', label: 'Tạm dừng', badge: 'bg-amber-100 text-amber-800' },
  { key: 'CLOSED', label: 'Đã đóng', badge: 'bg-gray-200 text-gray-700' },
];

const statusMeta = (key: string) => STATUSES.find((s) => s.key === key);

interface Fund {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  // BE trả Decimal của Prisma dưới dạng CHUỖI trong JSON ("10000000"), không phải number —
  // `Number(...)` trước khi tính toán, nếu không `+` sẽ nối chuỗi.
  goalAmount: string | number | null;
  currentAmount: string | number | null;
  status: string;
  isPrimary: boolean;
}

const toNumber = (v: string | number | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const formatVnd = (v: string | number | null | undefined) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(toNumber(v)));

const emptyForm = { name: '', description: '', image: '', goalAmount: '' };

export default function AdminCharityFundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // `apiClient` trả thẳng body; endpoint này trả MẢNG (không bọc {data}).
      const res = await apiClient.get<Fund[]>('/admin/charity/funds');
      setFunds(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách quỹ.');
      setFunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = form.name.trim();
      if (name.length < 3) {
        toast.error('Tên quỹ tối thiểu 3 ký tự.');
        return;
      }
      // goalAmount là số hoặc bỏ trống. Gửi chuỗi rỗng sẽ trượt @IsNumber của BE → 400.
      const goalRaw = form.goalAmount.trim();
      if (goalRaw && !Number.isFinite(Number(goalRaw))) {
        toast.error('Mục tiêu quỹ phải là số.');
        return;
      }
      const payload: Record<string, unknown> = {
        name,
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
      };
      if (goalRaw) payload.goalAmount = Number(goalRaw);

      setSaving(true);
      try {
        if (editingId) {
          await apiClient.patch(`/admin/charity/funds/${editingId}`, payload);
          toast.success('Đã cập nhật quỹ.');
        } else {
          await apiClient.post('/admin/charity/funds', payload);
          toast.success('Đã tạo quỹ.');
        }
        resetForm();
        await load();
      } catch (err: any) {
        toast.error(err?.message || 'Lưu quỹ thất bại.');
      } finally {
        setSaving(false);
      }
    },
    [editingId, form, load],
  );

  const changeStatus = useCallback(
    async (fund: Fund, status: string) => {
      setBusyId(fund.id);
      try {
        await apiClient.patch(`/admin/charity/funds/${fund.id}`, { status });
        toast.success(`"${fund.name}" → ${statusMeta(status)?.label ?? status}.`);
        await load();
      } catch (e: any) {
        toast.error(e?.message || 'Đổi trạng thái thất bại.');
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiHeart className="text-orange-500" /> Quỹ từ thiện
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quỹ là nơi nhận tiền quyên góp. Muốn hiện ô quyên góp ở trang thanh toán, tạo quỹ ở đây rồi
            gắn vào <Link href="/admin/charity/campaigns" className="text-[#E78720] underline">chiến dịch</Link>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <FiRefreshCw size={16} /> Tải lại
        </button>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Sửa quỹ' : 'Tạo quỹ mới'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tên quỹ *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Quỹ trẻ em vùng cao"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mục tiêu (đ)</label>
            <input
              value={form.goalAmount}
              onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
              inputMode="numeric"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="10000000"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Hỗ trợ giáo dục cho trẻ em miền núi"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Ảnh (URL)</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="https://…"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#E78720] text-white hover:bg-[#d47a1b] disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Tạo quỹ'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Huỷ sửa
            </button>
          )}
        </div>
      </form>

      {loading && <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">Đang tải…</div>}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
          <button type="button" onClick={() => void load()} className="ml-3 underline font-medium">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && funds.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Chưa có quỹ nào. Tạo quỹ đầu tiên bằng biểu mẫu phía trên.
        </div>
      )}

      {!loading && !error && funds.length > 0 && (
        <div className="space-y-3">
          {funds.map((fund) => {
            const goal = toNumber(fund.goalAmount);
            const current = toNumber(fund.currentAmount);
            const percent = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : null;
            const meta = statusMeta(fund.status);
            return (
              <div key={fund.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                        {meta?.label ?? fund.status}
                      </span>
                      {fund.isPrimary && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Quỹ mặc định
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 mt-1.5 break-words">{fund.name}</h3>
                    {fund.description && <p className="text-sm text-gray-600 mt-1 break-words">{fund.description}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Đã nhận <span className="font-semibold text-gray-700">{formatVnd(current)}đ</span>
                      {goal > 0 ? ` / mục tiêu ${formatVnd(goal)}đ` : ' · chưa đặt mục tiêu'}
                      {percent !== null ? ` (${percent}%)` : ''}
                    </p>
                    {percent !== null && (
                      <div className="mt-1.5 h-1.5 w-full max-w-xs bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E78720]" style={{ width: `${percent}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(fund.id);
                        setForm({
                          name: fund.name ?? '',
                          description: fund.description ?? '',
                          image: fund.image ?? '',
                          goalAmount: goal > 0 ? String(goal) : '',
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-[#E78720] hover:text-[#E78720]"
                    >
                      Sửa
                    </button>
                    {STATUSES.filter((s) => s.key !== fund.status).map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        disabled={busyId === fund.id}
                        onClick={() => void changeStatus(fund, s.key)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-[#E78720] hover:text-[#E78720] disabled:opacity-50"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
