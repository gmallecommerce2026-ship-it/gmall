'use client';

/**
 * wiki 0095 B6 — Trang "Link giới thiệu" (/user/affiliate).
 *
 * Khách yêu cầu: "bổ sung page tính năng copy affiliate link nhận điểm thưởng
 * (freestyle)".
 *
 * Vì sao tách khỏi /user/invite thay vì nhét thêm vào đó:
 *  - /user/invite là hành động GỬI ĐI (nhập email từng người, soạn lời nhắn).
 *  - Trang này là công cụ LAN TOẢ + theo dõi kết quả: copy link, chia sẻ mạng
 *    xã hội, xem đã mời được bao nhiêu người và nhận được bao nhiêu điểm.
 *  Gộp chung thì một trang phải gánh hai mục đích và phần thống kê bị chìm dưới
 *  form soạn mail.
 *
 * Số liệu + LUẬT THƯỞNG đều lấy từ BE (`GET /points/affiliate`), KHÔNG hardcode.
 * Banner cũ ở /user/invite ghi "đăng ký thành công là được 20.000 điểm" — sai so
 * với code thật (order.service.handleReferralReward): phải là bạn được mời có
 * đơn đầu tiên đạt giá trị tối thiểu VÀ giao thành công. Trang này nói đúng luật.
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

export default function AffiliatePage() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  // Dùng origin đang chạy thật (localhost / onrender / domain thật) thay vì
  // hardcode — cùng cách /user/invite đang làm (B3.6).
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
        // ApiClient trả THẲNG body JSON (không bọc .data như axios) — xem
        // ApiClient.request → res.json(). Đọc nhầm `.data` chính là bug đã làm
        // trang mời bạn bè luôn báo lỗi (wiki 0095 B4).
        const res: any = await apiClient.get('/points/affiliate');
        if (!cancelled && res) setStats(res as AffiliateStats);
      } catch (e) {
        // Không chặn trang: link giới thiệu vẫn copy được kể cả khi thống kê lỗi.
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

  const shareText = 'Mình đang dùng GMall - sàn quà tặng nhiều ưu đãi. Đăng ký qua link của mình nhé!';

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
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
        Link giới thiệu
      </h1>

      {/* Banner: nói ĐÚNG luật thưởng, số liệu lấy từ BE */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 mb-8 flex items-start gap-4 border border-orange-200">
        <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
          <Gift size={32} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Chia sẻ link - Nhận điểm thưởng
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Gửi link giới thiệu cho bạn bè. Khi bạn ấy đăng ký qua link của bạn và{' '}
            <span className="font-semibold">hoàn tất đơn hàng đầu tiên</span>
            {stats ? (
              <>
                {' '}từ <span className="font-bold text-orange-600">{formatNumber(stats.minOrderValue)}đ</span> trở lên
                (đơn đã giao thành công), bạn nhận{' '}
                <span className="font-bold text-orange-600">{formatNumber(stats.rewardPerFriend)} điểm thưởng</span>.
              </>
            ) : (
              <> (đơn đã giao thành công), bạn sẽ nhận điểm thưởng vào ví tích luỹ.</>
            )}
          </p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-3"
            >
              <div className={`p-2 rounded-lg ${card.tone}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-gray-800 leading-tight">
                  {loadingStats ? <span className="text-gray-300">···</span> : card.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Copy link */}
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Link2 size={18} className="text-green-500" /> Link giới thiệu của bạn
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
            <p className="text-sm text-gray-500 mb-4">
              Ai đăng ký qua link này sẽ được ghi nhận là bạn giới thiệu.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link đầy đủ</label>
            <div className="relative mb-4">
              <input
                type="text"
                readOnly
                value={referralLink}
                aria-label="Link giới thiệu"
                onFocus={(e) => e.currentTarget.select()}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copy(referralLink, 'link')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                title="Sao chép link"
              >
                {copied === 'link' ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã giới thiệu</label>
            <div className="relative mb-5">
              <input
                type="text"
                readOnly
                value={referralCode || '—'}
                aria-label="Mã giới thiệu"
                onFocus={(e) => e.currentTarget.select()}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => referralCode && copy(referralCode, 'code')}
                disabled={!referralCode}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-40"
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
              className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-brand-orange text-brand-orange font-medium hover:bg-orange-50 transition-colors ${
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
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Share2 size={18} className="text-blue-500" /> Chia sẻ nhanh
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {shareTargets.map((t) => {
                const Icon = t.icon;
                return (
                  <a
                    key={t.label}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-white text-xs font-medium transition-colors ${t.className}`}
                  >
                    <Icon size={18} />
                    {t.label}
                  </a>
                );
              })}
            </div>

            <h4 className="text-sm font-semibold text-gray-800 mb-2">Cách nhận điểm</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside mb-6">
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
                className="text-sm text-brand-orange hover:underline flex items-center gap-1.5"
              >
                <Mail size={14} /> Gửi thư mời qua email cho từng người
              </Link>
              <Link
                href="/user/reward-points"
                className="text-sm text-brand-orange hover:underline flex items-center gap-1.5"
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
