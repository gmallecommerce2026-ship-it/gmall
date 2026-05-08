'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CharityFund, Donation, CharityService } from '@/services/charity.service';
import { useUserStore } from '@/store/useUserStore';

function formatVND(amount: string | number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

export default function CharityFundClient({
  fund: initialFund,
  donations: initialDonations,
}: {
  fund: CharityFund;
  donations: Donation[];
}) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const [fund, setFund] = useState(initialFund);
  const [donations, setDonations] = useState(initialDonations);
  const [amount, setAmount] = useState(50000);
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập để đóng góp');
      router.push('/login');
      return;
    }
    if (amount < 1000) {
      toast.error('Số tiền tối thiểu 1.000đ');
      return;
    }

    setSubmitting(true);
    try {
      await CharityService.donate({
        fundId: fund.id,
        amount,
        note: note || undefined,
        isAnonymous,
      });
      toast.success('Cảm ơn bạn đã đóng góp!');

      // Re-fetch để hiển thị số liệu mới (currentAmount + list donations).
      // Không optimistic update vì BE trả exact amount + timestamp.
      const [nextFund, nextDonations] = await Promise.all([
        CharityService.getFund(fund.slug),
        CharityService.listDonations(fund.slug, 20),
      ]);
      setFund(nextFund);
      setDonations(nextDonations);
      setNote('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể xử lý donation';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const goal = Number(fund.goalAmount);
  const current = Number(fund.currentAmount);
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-[1fr_360px] gap-8">
      {/* LEFT: fund detail + donations list */}
      <article className="space-y-6">
        {fund.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fund.image} alt={fund.name} className="w-full h-64 object-cover rounded-2xl" />
        )}

        <h1 className="text-3xl font-bold text-gray-900">{fund.name}</h1>

        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span className="font-semibold text-brand-orange text-xl">
              {formatVND(current)}
            </span>
            <span className="self-center">
              {goal > 0 ? `${pct}% của ${formatVND(goal)}` : 'không giới hạn'}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-orange transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {fund.description && (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {fund.description}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Các đóng góp gần đây</h2>
          {donations.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có đóng góp nào. Bạn sẽ là người đầu tiên!</p>
          ) : (
            <ul className="divide-y">
              {donations.map((d) => {
                const who = d.isAnonymous
                  ? 'Người ủng hộ ẩn danh'
                  : d.user?.name ?? 'Người ủng hộ';
                return (
                  <li key={d.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{who}</p>
                      {d.note && <p className="text-sm text-gray-600 mt-1">{d.note}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(d.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className="font-semibold text-brand-orange whitespace-nowrap">
                      {formatVND(d.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </article>

      {/* RIGHT: donation form */}
      <aside className="md:sticky md:top-20 h-fit">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Đóng góp cho quỹ</h2>

          <form onSubmit={handleDonate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Số tiền</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v)}
                    className={`py-2 text-sm rounded-lg border transition-colors ${
                      amount === v
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {formatVND(v)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:border-brand-orange outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Lời nhắn (tùy chọn)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-brand-orange outline-none resize-none"
                placeholder="Gửi gắm của bạn..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
              />
              Đóng góp ẩn danh
            </label>

            <button
              type="submit"
              disabled={submitting || fund.status !== 'ACTIVE'}
              className="w-full py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {submitting
                ? 'Đang xử lý...'
                : fund.status !== 'ACTIVE'
                  ? 'Quỹ tạm dừng nhận'
                  : 'Đóng góp ngay'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
