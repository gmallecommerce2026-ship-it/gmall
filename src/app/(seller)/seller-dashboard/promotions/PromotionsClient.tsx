'use client';

import { useEffect, useState } from 'react';
import { VoucherService, Voucher } from '@/services/voucher.service';
import { apiClient } from '@/lib/api/ApiClient';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Pause, Play, X } from 'lucide-react';

const toInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function EditVoucherModal({ voucher, onClose, onSaved }: { voucher: any; onClose: () => void; onSaved: () => void }) {
  const used = Number(voucher.usageCount) > 0;
  const isPercent = voucher.type === 'PERCENTAGE';
  const [form, setForm] = useState({
    name: voucher.name ?? '',
    amount: String(Number(voucher.amount)),
    minOrderValue: String(Number(voucher.minOrderValue || 0)),
    maxDiscount: String(Number(voucher.maxDiscount || 0)),
    usageLimit: String(voucher.usageLimit),
    startDate: toInput(voucher.startDate),
    endDate: toInput(voucher.endDate),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Vui lòng nhập tên chương trình');
    if (new Date(form.endDate) <= new Date(form.startDate)) return setError('Ngày kết thúc phải sau ngày bắt đầu');

    setSaving(true);
    try {
      await apiClient.patch(`/promotions/seller/${voucher.id}`, {
        name: form.name.trim(),
        amount: Number(form.amount),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message || 'Không lưu được voucher');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-bold text-lg">Sửa voucher</h3>
            <p className="text-xs text-gray-500">Mã: <span className="font-semibold text-blue-600">{voucher.code}</span> (không đổi được)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên chương trình</label>
            <input className={inputCls} value={form.name} onChange={set('name')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mức giảm {isPercent ? '(%)' : '(đ)'}</label>
              <input type="number" className={inputCls} value={form.amount} onChange={set('amount')} disabled={used} />
              {used && <p className="text-[11px] text-orange-600 mt-1">Đã có người dùng, không đổi được mức giảm.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đơn tối thiểu (đ)</label>
              <input type="number" className={inputCls} value={form.minOrderValue} onChange={set('minOrderValue')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isPercent && (
              <div>
                <label className="block text-sm font-medium mb-1">Giảm tối đa (đ)</label>
                <input type="number" className={inputCls} value={form.maxDiscount} onChange={set('maxDiscount')} />
                <p className="text-[11px] text-gray-400 mt-1">0 = không giới hạn</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Tổng lượt dùng</label>
              <input type="number" min={Number(voucher.usageCount) || 1} className={inputCls} value={form.usageLimit} onChange={set('usageLimit')} />
              <p className="text-[11px] text-gray-400 mt-1">Đã dùng: {voucher.usageCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bắt đầu</label>
              <input type="datetime-local" className={inputCls} value={form.startDate} onChange={set('startDate')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kết thúc</label>
              <input type="datetime-local" className={inputCls} value={form.endDate} onChange={set('endDate')} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Huỷ</button>
          <button onClick={submit} disabled={saving} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromotionsClient() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const handleToggle = async (v: any) => {
    setBusyId(v.id);
    try {
      await apiClient.patch(`/promotions/seller/${v.id}`, { isActive: !v.isActive });
      await loadData();
    } catch (e: any) {
      alert(e?.message || 'Không cập nhật được trạng thái');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (v: any) => {
    if (!confirm(`Xoá voucher "${v.code}"? Hành động này không thể hoàn tác.`)) return;
    setBusyId(v.id);
    try {
      await apiClient.delete(`/promotions/seller/${v.id}`);
      await loadData();
    } catch (e: any) {
      alert(e?.message || 'Không xoá được voucher');
    } finally {
      setBusyId(null);
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
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4 text-center">Đang tải...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan={8} className="p-4 text-center">Chưa có voucher nào</td></tr>
            ) : vouchers.map((v: any) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold text-blue-600">{v.code}</td>
                <td className="p-4">{v.name}</td>
                <td className="p-4">
                  {v.type === 'PERCENTAGE' ? `${Number(v.amount)}%` : `${Number(v.amount).toLocaleString()}đ`}
                </td>
                <td className="p-4">{Number(v.minOrderValue || 0).toLocaleString()}đ</td>
                <td className="p-4 text-gray-600">{v.usageCount} / {v.usageLimit}</td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {v.isActive ? 'Đang chạy' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggle(v)}
                      disabled={busyId === v.id}
                      title={v.isActive ? 'Tạm dừng' : 'Chạy lại'}
                      className="p-2 rounded text-gray-500 hover:bg-gray-100 hover:text-orange-600 disabled:opacity-40"
                    >
                      {v.isActive ? <Pause size={17} /> : <Play size={17} />}
                    </button>
                    <button
                      onClick={() => setEditing(v)}
                      disabled={busyId === v.id}
                      title="Sửa"
                      className="p-2 rounded text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      disabled={busyId === v.id}
                      title="Xoá"
                      className="p-2 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditVoucherModal
          voucher={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadData(); }}
        />
      )}
    </div>
  );
}