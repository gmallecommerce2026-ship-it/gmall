'use client';

/**
 * wiki 0110 — màn xử lý khiếu nại / báo lỗi cho admin.
 *
 * Vì sao trang này ra đời: người bán gửi khiếu nại từ Kênh người bán
 * (`/seller-dashboard/help/reports` → `POST /complaints`), BE lưu vào bảng `Complaint` và
 * đã mở sẵn `GET /admin/complaints` + `PATCH /admin/complaints/:id/status` — nhưng FE
 * CHƯA TỪNG có màn hình admin nào. Khiếu nại vào DB rồi nằm đó, không ai đọc, người gửi
 * thì thấy trạng thái treo ở "Chờ xử lý" mãi mãi.
 *
 * Đây là chiều ngược của bug wiki 0109: lần đó trang có mà menu không có; lần này API có
 * mà màn hình không có. Cùng một hậu quả với người dùng: bấm mãi không thấy chỗ nào xử lý.
 *
 * NGUYÊN TẮC (giữ như wiki 0104/0105): API lỗi thì HIỆN LỖI, không đổ dữ liệu mẫu. Đây là
 * màn hình admin ra quyết định, một dòng khiếu nại bịa còn tệ hơn danh sách trống.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { AdminService } from '@/services/AdminService';

// Bốn giá trị này do BE quy định (`VALID_STATUSES` trong complaint.service.ts). Đặt sai
// một chữ là BE trả 400 "Trạng thái không hợp lệ", nên giữ nguyên chữ thường như BE.
const STATUSES = [
  { key: 'open', label: 'Chờ xử lý', badge: 'bg-amber-100 text-amber-800' },
  { key: 'processing', label: 'Đang xử lý', badge: 'bg-blue-100 text-blue-800' },
  { key: 'resolved', label: 'Đã giải quyết', badge: 'bg-green-100 text-green-800' },
  { key: 'rejected', label: 'Từ chối', badge: 'bg-gray-200 text-gray-700' },
];

const FILTERS = [...STATUSES.map((s) => ({ key: s.key, label: s.label })), { key: 'ALL', label: 'Tất cả' }];

const statusMeta = (key: string) => STATUSES.find((s) => s.key === key);

interface ComplaintRow {
  id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  adminNote: string | null;
  relatedOrderId: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user?: { id: string; name: string | null; email: string | null } | null;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('vi-VN');
};

export default function AdminComplaintsPage() {
  const [filter, setFilter] = useState('open');
  const [rows, setRows] = useState<ComplaintRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // `apiClient` trả THẲNG body JSON (không bọc `.data` như axios) — BE trả
      // `{ data, meta }`, nên `res.data` ở đây là mảng khiếu nại, không phải body.
      const res: any = await AdminService.getComplaints({
        limit: 50,
        status: filter === 'ALL' ? undefined : filter,
      });
      setRows(res?.data ?? []);
      setTotal(res?.meta?.total ?? 0);
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách khiếu nại.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = useCallback(
    async (id: string, status: string, adminNote?: string) => {
      setBusyId(id);
      try {
        await AdminService.updateComplaintStatus(id, status, adminNote);
        toast.success(`Đã chuyển sang "${statusMeta(status)?.label ?? status}".`);
        setNoteFor(null);
        setNote('');
        await load();
      } catch (e: any) {
        toast.error(e?.message || 'Cập nhật trạng thái thất bại.');
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
            <FiAlertCircle className="text-orange-500" /> Khiếu nại &amp; Báo lỗi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Khiếu nại do người bán gửi từ Kênh người bán. Đổi trạng thái để người gửi thấy tiến độ.
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

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filter === f.key
                ? 'bg-[#E78720] text-white border-[#E78720]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#E78720] hover:text-[#E78720]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">Đang tải…</div>}

      {/* Lỗi API hiện nguyên văn, danh sách để TRỐNG — xem chú thích đầu file. */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
          <button type="button" onClick={() => void load()} className="ml-3 underline font-medium">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Không có khiếu nại nào ở trạng thái này.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <p className="text-sm text-gray-500">{total} khiếu nại</p>
          <div className="space-y-3">
            {rows.map((row) => {
              const meta = statusMeta(row.status);
              return (
                <div key={row.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                          {meta?.label ?? row.status}
                        </span>
                        <span className="text-[11px] text-gray-400 uppercase tracking-wide">{row.category}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mt-1.5 break-words">{row.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">{row.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {row.user?.name || row.user?.email || 'Người dùng đã xoá'} · {formatDate(row.createdAt)}
                        {row.relatedOrderId ? ` · Đơn ${row.relatedOrderId}` : ''}
                      </p>
                      {row.adminNote && (
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                          <span className="font-semibold">Ghi chú của admin:</span> {row.adminNote}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {STATUSES.filter((s) => s.key !== row.status).map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => {
                            // "Giải quyết"/"Từ chối" là kết luận gửi tới người khiếu nại →
                            // mở ô ghi chú trước. "Đang xử lý" chỉ là báo đã tiếp nhận nên đi thẳng.
                            if (s.key === 'resolved' || s.key === 'rejected') {
                              setNoteFor(`${row.id}:${s.key}`);
                              setNote(row.adminNote ?? '');
                            } else {
                              void changeStatus(row.id, s.key);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-[#E78720] hover:text-[#E78720] disabled:opacity-50"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {noteFor?.startsWith(`${row.id}:`) && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ghi chú gửi kèm (người gửi khiếu nại sẽ đọc được)
                      </label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="Ví dụ: đã hoàn tiền đơn #123 ngày 20/08."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => void changeStatus(row.id, noteFor.split(':')[1], note.trim() || undefined)}
                          className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[#E78720] text-white hover:bg-[#d47a1b] disabled:opacity-50"
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNoteFor(null);
                            setNote('');
                          }}
                          className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
