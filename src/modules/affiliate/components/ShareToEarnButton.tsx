'use client';

/**
 * wiki 0105 — nút "Chia sẻ kiếm hoa hồng" trên trang chi tiết sản phẩm.
 *
 * Đây là nguyên văn yêu cầu của khách: *"chia sẻ link affiliate trên từng sản phẩm"*.
 * Trang sản phẩm là chỗ chia sẻ tự nhiên nhất — người ta đang xem món hàng thì mới nghĩ
 * tới việc giới thiệu nó.
 *
 * Nút chỉ hiện khi sản phẩm CÓ bật affiliate và người xem ĐÃ được duyệt làm người tiếp
 * thị. Hiện cho người chưa đủ điều kiện rồi báo lỗi khi họ bấm là cách chắc chắn làm họ
 * bực; thay vào đó, người chưa đăng ký thấy một lời mời nhẹ nhàng dẫn sang trang đăng ký.
 */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Check, Copy, Facebook, MessageCircle, Share2, X } from 'lucide-react';
import { AffiliateService, type AffiliateMe, type AffiliateLink } from '@/services/AffiliateService';
import { useUserStore } from '@/store/useUserStore';

const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

export default function ShareToEarnButton({
  productId,
  productName,
  affiliateEnabled,
  affiliateRate,
  price,
}: {
  productId: string;
  productName: string;
  affiliateEnabled?: boolean;
  affiliateRate?: number | null;
  price?: number;
}) {
  const { isAuthenticated } = useUserStore();
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<AffiliateLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    if (!isAuthenticated || !affiliateEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await AffiliateService.getMe();
        if (!cancelled && res) setMe(res);
      } catch {
        /* im lặng: đây là tính năng phụ, không được làm ồn trên trang mua hàng */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, affiliateEnabled]);

  const openModal = useCallback(async () => {
    setOpen(true);
    if (link) return;
    setLoading(true);
    try {
      const res = await AffiliateService.createLink(productId);
      if (res) setLink(res);
    } catch (e: any) {
      toast.error(e?.message || 'Không lấy được link tiếp thị.');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [productId, link]);

  const fullLink = link ? `${origin}${link.path}` : '';

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Đã sao chép link tiếp thị!');
    } catch {
      toast.error('Trình duyệt chặn sao chép. Bạn hãy bôi đen và copy thủ công nhé.');
    }
  }, [fullLink]);

  if (!affiliateEnabled || !affiliateRate) return null;

  const commission = Math.floor((price ?? 0) * affiliateRate);

  // Chưa đăng nhập hoặc chưa được duyệt → lời mời, không phải nút bấm rồi báo lỗi.
  if (!isAuthenticated || me?.status !== 'APPROVED') {
    return (
      <Link
        href="/user/affiliate"
        className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-brand-orange/60 bg-orange-50/60 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50"
      >
        <Share2 size={16} className="shrink-0 text-brand-orange" />
        <span>
          Chia sẻ sản phẩm này để nhận{' '}
          <span className="font-semibold text-brand-orange">
            {formatVnd(commission)}đ
          </span>{' '}
          hoa hồng —{' '}
          <span className="font-medium underline">tham gia tiếp thị liên kết</span>
        </span>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-orange bg-white px-4 py-2.5 text-sm font-medium text-brand-orange transition-colors hover:bg-orange-50"
      >
        <Share2 size={16} />
        Chia sẻ kiếm hoa hồng · {formatVnd(commission)}đ/sản phẩm
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Link tiếp thị"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Link tiếp thị của bạn</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">Đang tạo link…</div>
            ) : (
              <>
                <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-gray-700">
                  Mỗi sản phẩm bán được qua link này, bạn nhận{' '}
                  <span className="font-bold text-brand-orange">{formatVnd(commission)}đ</span> (
                  {(affiliateRate * 100).toFixed(1)}%). Tiền vào mục{' '}
                  <span className="font-medium">tạm tính</span> khi khách nhận hàng, và{' '}
                  <span className="font-medium">rút được sau kỳ chốt sổ hàng tháng</span>.
                </div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Link đầy đủ
                </label>
                <div className="relative mb-4">
                  <input
                    type="text"
                    readOnly
                    value={fullLink}
                    aria-label="Link tiếp thị"
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-4 pr-12 text-sm text-gray-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={copy}
                    title="Sao chép"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors hover:bg-gray-200"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={copy}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-brand-orange py-3 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Copy size={18} />
                    Sao chép
                  </button>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-[#1877F2] py-3 text-xs font-medium text-white transition-colors hover:bg-[#0f66d0]"
                  >
                    <Facebook size={18} />
                    Facebook
                  </a>
                  <a
                    href={`https://zalo.me/share/link?url=${encodeURIComponent(fullLink)}&title=${encodeURIComponent(productName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-[#0068FF] py-3 text-xs font-medium text-white transition-colors hover:bg-[#0055d4]"
                  >
                    <MessageCircle size={18} />
                    Zalo
                  </a>
                </div>

                <Link
                  href="/user/affiliate"
                  className="mt-4 block text-center text-sm text-brand-orange hover:underline"
                >
                  Xem tất cả link &amp; hoa hồng của bạn →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
