'use client';

/**
 * wiki 0105 — tab đăng ký / trạng thái hồ sơ người tiếp thị.
 *
 * Khách chốt mô hình "đăng ký + admin duyệt" (thay vì ai đăng nhập cũng làm được), nên
 * component này có bốn mặt tuỳ trạng thái hồ sơ. Trạng thái nào cũng phải nói rõ NGƯỜI
 * DÙNG CẦN LÀM GÌ TIẾP — màn hình chỉ báo trạng thái mà không chỉ lối đi là màn hình cụt.
 */

import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import { AffiliateService, type AffiliateMe } from '@/services/AffiliateService';

const CHANNELS = ['Facebook', 'TikTok', 'Zalo', 'YouTube', 'Instagram', 'Khác'];

export default function AffiliateRegisterTab({
  me,
  onRegistered,
}: {
  me: AffiliateMe | null;
  onRegistered: (next: AffiliateMe) => void;
}) {
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await AffiliateService.register({ channel, note });
      toast.success('Đã gửi đăng ký. Chờ quản trị viên duyệt nhé!');
      onRegistered({
        registered: true,
        status: res?.status ?? 'PENDING',
        code: res?.code,
        channel,
      });
    } catch (e: any) {
      // Hiện nguyên văn lý do từ BE (đã đăng ký rồi / đang bị đình chỉ…) thay vì câu
      // chung chung — người dùng cần biết vì sao để biết làm gì tiếp.
      toast.error(e?.message || 'Không gửi được đăng ký, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }, [channel, note, onRegistered]);

  if (me?.registered && me.status === 'PENDING') {
    return (
      <StatusCard
        icon={<Clock size={32} className="text-amber-500" />}
        title="Hồ sơ đang chờ duyệt"
        body="Quản trị viên sẽ xem xét trong thời gian sớm nhất. Khi được duyệt, bạn sẽ lấy được link tiếp thị cho từng sản phẩm và bắt đầu nhận hoa hồng."
      />
    );
  }

  if (me?.registered && me.status === 'APPROVED') {
    return (
      <StatusCard
        icon={<CheckCircle2 size={32} className="text-green-500" />}
        title="Bạn đã là người tiếp thị"
        body={`Mã tiếp thị của bạn: ${me.code ?? '—'}. Sắp tới bạn sẽ chọn được sản phẩm của các shop và lấy link chia sẻ ngay tại đây.`}
      />
    );
  }

  if (me?.registered && me.status === 'SUSPENDED') {
    return (
      <StatusCard
        icon={<ShieldAlert size={32} className="text-red-500" />}
        title="Tài khoản tiếp thị đang bị đình chỉ"
        body={me.rejectReason || 'Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.'}
      />
    );
  }

  return (
    <div className="max-w-xl">
      {me?.registered && me.status === 'REJECTED' && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div className="text-sm text-red-800">
            <div className="font-semibold">Hồ sơ trước đã bị từ chối</div>
            <div className="mt-0.5">{me.rejectReason || 'Không nêu lý do.'}</div>
            <div className="mt-1 text-red-700">Bạn có thể bổ sung thông tin và gửi lại.</div>
          </div>
        </div>
      )}

      <h2 className="mb-2 text-lg font-bold text-gray-800">Đăng ký làm người tiếp thị</h2>
      <p className="mb-6 text-sm leading-relaxed text-gray-600">
        Chia sẻ link sản phẩm của các shop trên GMall. Khi có người mua qua link của bạn và
        nhận hàng thành công, bạn nhận <span className="font-semibold">hoa hồng bằng tiền mặt</span>{' '}
        vào ví và rút về tài khoản ngân hàng.
      </p>

      <label htmlFor="aff-channel" className="mb-1.5 block text-sm font-medium text-gray-700">
        Bạn chia sẻ chủ yếu ở đâu?
      </label>
      <select
        id="aff-channel"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
      >
        {CHANNELS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label htmlFor="aff-note" className="mb-1.5 block text-sm font-medium text-gray-700">
        Giới thiệu thêm{' '}
        <span className="text-xs font-normal text-gray-400">(không bắt buộc)</span>
      </label>
      <textarea
        id="aff-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Ví dụ: mình có nhóm Facebook 5.000 thành viên về mẹ và bé."
        className="mb-6 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
      />

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full rounded-lg bg-brand-orange py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Đang gửi...' : 'Gửi đăng ký'}
      </button>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex max-w-xl items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="shrink-0">{icon}</div>
      <div>
        <h2 className="mb-1 text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-sm leading-relaxed text-gray-600">{body}</p>
      </div>
    </div>
  );
}
