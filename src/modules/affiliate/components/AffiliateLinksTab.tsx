'use client';

/**
 * wiki 0105 — tab "Link của tôi": mọi link đã lấy, kèm số click / số đơn / tiền kiếm được.
 *
 * Cảnh báo quan trọng: seller có thể TẮT affiliate sau khi người ta đã lấy link. Link cũ
 * vẫn dẫn tới sản phẩm nhưng KHÔNG còn sinh hoa hồng. Phải nói thẳng ra, nếu không người
 * tiếp thị sẽ tiếp tục quảng bá miễn phí cho shop mà không biết.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Check, Copy, Link2, MousePointerClick, ShoppingBag } from 'lucide-react';
import { AffiliateService, type AffiliateLink } from '@/services/AffiliateService';

const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

export default function AffiliateLinksTab() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await AffiliateService.listLinks(page);
        if (cancelled) return;
        setLinks(res?.data ?? []);
        setMeta({
          page: res?.meta?.page ?? 1,
          totalPages: res?.meta?.totalPages ?? 1,
          total: res?.meta?.total ?? 0,
        });
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Không tải được danh sách link.');
        setLinks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const copy = useCallback(
    async (link: AffiliateLink) => {
      try {
        await navigator.clipboard.writeText(`${origin}${link.path}`);
        setCopiedCode(link.code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast.success('Đã sao chép link!');
      } catch {
        toast.error('Trình duyệt chặn sao chép. Bạn hãy bôi đen và copy thủ công nhé.');
      }
    },
    [origin],
  );

  if (loading) return <div className="py-12 text-center text-sm text-gray-400">Đang tải…</div>;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <Link2 size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-gray-600">Bạn chưa lấy link nào.</p>
        <p className="mt-1 text-sm text-gray-500">
          Sang tab <span className="font-medium">Chọn sản phẩm</span> để lấy link đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 text-sm text-gray-500">{formatVnd(meta.total)} link</div>

      <div className="space-y-3">
        {links.map((l) => (
          <div
            key={l.id}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {l.product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.product.image}
                  alt={l.product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-sm font-medium text-gray-800">{l.product.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MousePointerClick size={13} /> {formatVnd(l.clicks)} lượt bấm
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag size={13} /> {formatVnd(l.orders ?? 0)} đơn
                </span>
                <span className="text-green-600">
                  Đã nhận {formatVnd(l.earnedSettled ?? 0)}đ
                </span>
                {(l.earnedPending ?? 0) > 0 && (
                  <span className="text-amber-600">
                    Chờ {formatVnd(l.earnedPending ?? 0)}đ
                  </span>
                )}
              </div>

              {!l.product.affiliateEnabled && (
                <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    Người bán đã tắt tiếp thị cho sản phẩm này — link vẫn mở được nhưng{' '}
                    <span className="font-semibold">không còn sinh hoa hồng</span>.
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => copy(l)}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand-orange px-4 py-2 text-sm font-medium text-brand-orange transition-colors hover:bg-orange-50"
            >
              {copiedCode === l.code ? <Check size={15} /> : <Copy size={15} />}
              {copiedCode === l.code ? 'Đã chép' : 'Chép link'}
            </button>
          </div>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.page <= 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {meta.page}/{meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={meta.page >= meta.totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
