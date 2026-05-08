'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FiClock, FiCheckCircle, FiUploadCloud, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { InputGroup } from '@/components/ui/InputGroup';
import {
  ComplaintService,
  type Complaint,
  type ComplaintCategory,
} from '@/services/complaint.service';
import { uploadFileToR2 } from '@/services/uploadService';

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  shipping: 'Vận chuyển / Giao nhận',
  product: 'Sản phẩm / Kiểm duyệt',
  finance: 'Tài chính / Đối soát',
  system: 'Lỗi hệ thống / Khác',
  other: 'Khác',
};

const STATUS_LABELS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  open: { label: 'Đang chờ', cls: 'text-orange-600 bg-orange-50', icon: <FiClock size={12} /> },
  processing: { label: 'Đang xử lý', cls: 'text-blue-600 bg-blue-50', icon: <FiClock size={12} /> },
  resolved: {
    label: 'Đã giải quyết',
    cls: 'text-green-600 bg-green-50',
    icon: <FiCheckCircle size={12} />,
  },
  rejected: { label: 'Từ chối', cls: 'text-red-600 bg-red-50', icon: <FiAlertCircle size={12} /> },
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form state
  const [category, setCategory] = useState<ComplaintCategory>('shipping');
  const [orderId, setOrderId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // History state
  const [history, setHistory] = useState<Complaint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await ComplaintService.listMine({ limit: 20 });
      setHistory(res?.data || []);
    } catch (e) {
      console.error('Load history failed', e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab, loadHistory]);

  const resetForm = () => {
    setCategory('shipping');
    setOrderId('');
    setTitle('');
    setContent('');
    setFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(e.target.files || []);
    if (next.length === 0) return;
    // Cap 5 file × 10MB để không upload chậm
    const filtered = next.filter((f) => f.size <= 10 * 1024 * 1024);
    if (filtered.length !== next.length) toast.error('Một số file vượt 10MB đã bị bỏ qua');
    setFiles((prev) => [...prev, ...filtered].slice(0, 5));
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng điền tiêu đề và nội dung');
      return;
    }
    setSubmitting(true);
    try {
      // Upload từng file song song. Promise.all dừng nếu 1 cái fail — đỡ
      // tạo complaint với attachment thiếu.
      const attachments = files.length > 0
        ? await Promise.all(files.map((f) => uploadFileToR2(f)))
        : [];
      await ComplaintService.create({
        category,
        title,
        content,
        relatedOrderId: orderId || undefined,
        attachments: attachments.filter(Boolean) as string[],
      });
      toast.success('Đã gửi khiếu nại! GMall sẽ phản hồi trong 24h làm việc.');
      resetForm();
      setActiveTab('history');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gửi khiếu nại thất bại';
      toast.error(typeof msg === 'string' ? msg : 'Gửi khiếu nại thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Giải quyết khiếu nại & Báo cáo</h1>
        <p className="text-gray-500 text-sm mt-1">
          GMall cam kết xử lý các khiếu nại của Đối tác trong vòng 24h làm việc.
        </p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Gửi khiếu nại mới
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử khiếu nại
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'create' ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vấn đề liên quan đến
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['shipping', 'product', 'finance', 'system'] as ComplaintCategory[]).map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`cursor-pointer px-4 py-3 rounded-lg border text-sm text-center transition-all ${
                          category === cat
                            ? 'border-brand-orange bg-orange-50 text-brand-orange font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <InputGroup
                  label="Mã đơn hàng liên quan (Nếu có)"
                  placeholder="Ví dụ: #DH123456"
                  value={orderId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderId(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề khiếu nại</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none"
                    placeholder="Tóm tắt vấn đề của bạn"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Nội dung chi tiết</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    maxLength={5000}
                    className="w-full h-40 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                    placeholder="Mô tả chi tiết vấn đề, thời gian xảy ra sự cố..."
                  />
                </div>

                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                  <FiUploadCloud size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-brand-orange">Tải lên hình ảnh/video bằng chứng</span>
                  <span className="text-xs mt-1">JPG/PNG/MP4 (Tối đa 5 file × 10MB)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {files.length > 0 && (
                  <ul className="text-xs text-gray-600 space-y-1">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded">
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:text-red-700 ml-2"
                          aria-label="Xóa file"
                        >
                          <FiX size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={resetForm}>
                Hủy bỏ
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
              </Button>
            </div>
          </form>
        ) : loadingHistory ? (
          <div className="py-10 flex flex-col items-center justify-center text-gray-500">
            <FiRefreshCw className="animate-spin mb-3" size={28} />
            <p>Đang tải lịch sử...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">Chưa có khiếu nại nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-3 font-medium pl-2">Mã phiếu</th>
                  <th className="pb-3 font-medium">Tiêu đề</th>
                  <th className="pb-3 font-medium">Danh mục</th>
                  <th className="pb-3 font-medium">Ngày tạo</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {history.map((c) => {
                  const status = STATUS_LABELS[c.status] || STATUS_LABELS.open;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 pl-2 font-mono text-xs text-gray-700">
                        #{c.id.split('-')[0].toUpperCase()}
                      </td>
                      <td className="py-4 text-gray-700">{c.title}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {CATEGORY_LABELS[c.category as ComplaintCategory] || c.category}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{formatDate(c.createdAt)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${status.cls}`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
