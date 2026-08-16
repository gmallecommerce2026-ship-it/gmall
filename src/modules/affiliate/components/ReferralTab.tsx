'use client';

/**
 * wiki 0105 — tab "Giới thiệu bạn bè".
 *
 * Đây là NỘI DUNG CŨ của trang `/user/affiliate` (wiki 0095 B6), chuyển nguyên vẹn vào
 * đây khi trang được tách thành nhiều tab. Không sửa logic, chỉ di chuyển: khách nhận
 * xét phần này "hơi giống tính năng mời bạn bè" — đúng, vì nó LÀ giới thiệu bạn bè.
 * Nó không sai, nó chỉ đang chiếm nhầm chỗ của affiliate sản phẩm.
 *
 * Số liệu + LUẬT THƯỞNG vẫn lấy từ BE (`GET /points/affiliate`), KHÔNG hardcode.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Check,
  Copy,
  Facebook,
  Gift,
  Link2,
  Mail,
  MessageCircle,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/api/ApiClient';

interface AffiliateStats {
  invitedCount: number;
  rewardedCount: number;
  pendingCount: number;
  pointsEarned: number;
  rewardPerFriend: number;
  minOrderValue: number;
}

const formatNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0);

export default function ReferralTab() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  // Dùng origin đang chạy thật (localhost / onrender / domain thật) thay vì hardcode.
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const referralCode = user?.id ?? '';
  const referralLink = useMemo(
    () => (referralCode ? `${origin}/register?ref=${referralCode}` : `${origin}/register`),
    [origin, referralCode],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ApiClient trả THẲNG body JSON (không bọc .data như axios).
        const res: any = await apiClient.get('/points/affiliate');
        if (!cancelled && res) setStats(res as AffiliateStats);
      } catch (e) {
        // Không chặn tab: link giới thiệu vẫn copy được kể cả khi thống kê lỗi.
        console.error('[affiliate] không tải được thống kê:', e);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = useCallback(async (text: string, what: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
      toast.success(what === 'link' ? 'Đã sao chép link giới thiệu!' : 'Đã sao chép mã giới thiệu!');
    } catch {
      toast.error('Trình duyệt chặn sao chép. Bạn hãy bôi đen và copy thủ công nhé.');
    }
  }, []);

  const shareText =
    'Mình đang dùng GMall - sàn quà tặng nhiều ưu đãi. Đăng ký qua link của mình nhé!';

  const shareTargets = [
    {
      label: 'Facebook',
      icon: Facebook,
      className: 'bg-[#1877F2] hover:bg-[#0f66d0]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
    {
      label: 'Zalo',
      icon: MessageCircle,
      className: 'bg-[#0068FF] hover:bg-[#0055d4]',
      href: `https://zalo.me/share/link?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent(shareText)}`,
    },
    {
      label: 'Email',
      icon: Mail,
      className: 'bg-gray-600 hover:bg-gray-700',
      href: `mailto:?subject=${encodeURIComponent('Mời bạn tham gia GMall')}&body=${encodeURIComponent(`${shareText}\n\n${referralLink}`)}`,
    },
  ];

  const statCards = [
    {
      label: 'Bạn bè đã đăng ký',
      value: stats ? formatNumber(stats.invitedCount) : '—',
      icon: Users,
      tone: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Đã chốt thưởng',
      value: stats ? formatNumber(stats.rewardedCount) : '—',
      icon: Check,
      tone: 'text-green-600 bg-green-50',
    },
    {
      label: 'Đang chờ đủ điều kiện',
      value: stats ? formatNumber(stats.pendingCount) : '—',
      icon: TrendingUp,
      tone: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Điểm đã nhận',
      value: stats ? formatNumber(stats.pointsEarned) : '—',
      icon: Sparkles,
      tone: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <div>
      {/* Banner: nói ĐÚNG luật thưởng, số liệu lấy từ BE */}
      <div className="mb-8 flex items-start gap-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-100 to-orange-50 p-6">
        <div className="shrink-0 rounded-full bg-white p-3 shadow-sm">
          <Gift size={32} className="text-orange-500" />
        </div>
        <div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">
            Chia sẻ link - Nhận điểm thưởng
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            Gửi link giới thiệu cho bạn bè. Khi bạn ấy đăng ký qua link của bạn và{' '}
            <span className="font-semibold">hoàn tất đơn hàng đầu tiên</span>
            {stats ? (
              <>
                {' '}
                từ{' '}
                <span className="font-bold text-orange-600">
                  {formatNumber(stats.minOrderValue)}đ
                </span>{' '}
                trở lên (đơn đã giao thành công), bạn nhận{' '}
                <span className="font-bold text-orange-600">
                  {formatNumber(stats.rewardPerFriend)} điểm thưởng
                </span>
                .
              </>
            ) : (
              <> (đơn đã giao thành công), bạn sẽ nhận điểm thưởng vào ví tích luỹ.</>
            )}
          </p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className={`rounded-lg p-2 ${card.tone}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold leading-tight text-gray-800">
                  {loadingStats ? <span className="text-gray-300">···</span> : card.value}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Copy link */}
        <div className="flex flex-col">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
            <Link2 size={18} className="text-green-500" /> Link giới thiệu của bạn
          </h3>
          <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm text-gray-500">
              Ai đăng ký qua link này sẽ được ghi nhận là bạn giới thiệu.
            </p>

            <label className="mb-1.5 block text-sm font-medium text-gray-700">Link đầy đủ</label>
            <div className="relative mb-4">
              <input
                type="text"
                readOnly
                value={referralLink}
                aria-label="Link giới thiệu"
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-4 pr-12 text-sm font-medium text-gray-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copy(referralLink, 'link')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors hover:bg-gray-200"
                title="Sao chép link"
              >
                {copied === 'link' ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>

            <label className="mb-1.5 block text-sm font-medium text-gray-700">Mã giới thiệu</label>
            <div className="relative mb-5">
              <input
                type="text"
                readOnly
                value={referralCode || '—'}
                aria-label="Mã giới thiệu"
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-4 pr-12 font-mono text-sm text-gray-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => referralCode && copy(referralCode, 'code')}
                disabled={!referralCode}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors hover:bg-gray-200 disabled:opacity-40"
                title="Sao chép mã"
              >
                {copied === 'code' ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => copy(referralLink, 'link')}
              className={`mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-brand-orange py-2.5 font-medium text-brand-orange transition-colors hover:bg-orange-50 ${
                copied === 'link' ? 'bg-orange-50' : ''
              }`}
            >
              <Copy size={16} />
              {copied === 'link' ? 'Đã sao chép!' : 'Sao chép link giới thiệu'}
            </button>
          </div>
        </div>

        {/* Chia sẻ + hướng dẫn */}
        <div className="flex flex-col">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
            <Share2 size={18} className="text-blue-500" /> Chia sẻ nhanh
          </h3>
          <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-6 grid grid-cols-3 gap-3">
              {shareTargets.map((t) => {
                const Icon = t.icon;
                return (
                  <a
                    key={t.label}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg py-3 text-xs font-medium text-white transition-colors ${t.className}`}
                  >
                    <Icon size={18} />
                    {t.label}
                  </a>
                );
              })}
            </div>

            <h4 className="mb-2 text-sm font-semibold text-gray-800">Cách nhận điểm</h4>
            <ol className="mb-6 list-inside list-decimal space-y-2 text-sm text-gray-600">
              <li>Sao chép link ở bên cạnh và gửi cho bạn bè.</li>
              <li>Bạn ấy bấm link rồi đăng ký tài khoản GMall.</li>
              <li>
                Bạn ấy đặt và nhận thành công đơn hàng đầu tiên
                {stats ? ` từ ${formatNumber(stats.minOrderValue)}đ` : ''}.
              </li>
              <li>
                Điểm thưởng
                {stats ? ` ${formatNumber(stats.rewardPerFriend)} điểm` : ''} vào ví của bạn — mỗi
                người bạn được tính một lần.
              </li>
            </ol>

            <div className="mt-auto flex flex-col gap-2">
              <Link
                href="/user/invite"
                className="flex items-center gap-1.5 text-sm text-brand-orange hover:underline"
              >
                <Mail size={14} /> Gửi thư mời qua email cho từng người
              </Link>
              <Link
                href="/user/reward-points"
                className="flex items-center gap-1.5 text-sm text-brand-orange hover:underline"
              >
                <Sparkles size={14} /> Xem lịch sử điểm thưởng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
