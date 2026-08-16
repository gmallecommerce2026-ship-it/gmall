'use client';

/**
 * wiki 0105 — tab "Chọn sản phẩm".
 *
 * ĐÂY LÀ YÊU CẦU CHÍNH của khách: *"bổ sung thêm phần chọn danh sách sp thuộc các shop
 * với chia sẻ link affiliate trên từng sản phẩm"*. Duyệt hàng của MỌI shop đang bật
 * tiếp thị, lọc theo shop, và mỗi sản phẩm có nút "Lấy link".
 *
 * Mỗi thẻ sản phẩm nói rõ SỐ TIỀN kiếm được trên một đơn vị, không chỉ phần trăm: "8%"
 * là con số trừu tượng, "16.000đ" là thứ khiến người ta bấm chia sẻ.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, Copy, Link2, Search, Store, X } from 'lucide-react';
import {
  AffiliateService,
  type AffiliateLink,
  type AffiliateProduct,
} from '@/services/AffiliateService';

const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

const SORTS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'rate', label: 'Hoa hồng cao' },
  { key: 'bestseller', label: 'Bán chạy' },
  { key: 'price_asc', label: 'Giá thấp → cao' },
  { key: 'price_desc', label: 'Giá cao → thấp' },
];

export default function AffiliateProductsTab() {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [shops, setShops] = useState<{ id: string; name: string; productCount: number }[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [shopId, setShopId] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [modalLink, setModalLink] = useState<AffiliateLink | null>(null);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.origin), []);

  // Gõ tới đâu gọi API tới đó sẽ bắn hàng chục request thừa; chờ 400ms sau nhịp gõ cuối.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await AffiliateService.listShops();
        if (!cancelled && Array.isArray(res)) setShops(res);
      } catch {
        /* bộ lọc shop hỏng không đáng chặn cả tab */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await AffiliateService.listProducts({
          search: debounced || undefined,
          shopId: shopId || undefined,
          sort,
          page,
        });
        if (cancelled) return;
        setProducts(res?.data ?? []);
        setMeta({
          page: res?.meta?.page ?? 1,
          totalPages: res?.meta?.totalPages ?? 1,
          total: res?.meta?.total ?? 0,
        });
      } catch (e: any) {
        if (cancelled) return;
        // Báo lỗi thật, KHÔNG đổ dữ liệu mẫu. Màn hình liên quan tới tiền mà bịa số là
        // lỗi 🔴 đã phải sửa ở wiki 0104.
        setError(e?.message || 'Không tải được danh sách sản phẩm.');
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, shopId, sort, page]);

  const getLink = useCallback(async (p: AffiliateProduct) => {
    setCreatingFor(p.id);
    try {
      const res = await AffiliateService.createLink(p.id);
      if (res) setModalLink(res);
    } catch (e: any) {
      toast.error(e?.message || 'Không lấy được link tiếp thị.');
    } finally {
      setCreatingFor(null);
    }
  }, []);

  const fullLink = modalLink ? `${origin}${modalLink.path}` : '';

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

  return (
    <div>
      {/* Bộ lọc */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm để chia sẻ…"
            aria-label="Tìm sản phẩm"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>

        <select
          value={shopId}
          onChange={(e) => {
            setShopId(e.target.value);
            setPage(1);
          }}
          aria-label="Lọc theo shop"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="">Tất cả shop</option>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.productCount})
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          aria-label="Sắp xếp"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Đang tải sản phẩm…</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <Store size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">
            {debounced || shopId
              ? 'Không tìm thấy sản phẩm phù hợp.'
              : 'Chưa có shop nào bật tiếp thị liên kết.'}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {debounced || shopId
              ? 'Thử bỏ bớt bộ lọc xem sao.'
              : 'Người bán cần tự bật tiếp thị cho sản phẩm của họ. Bạn quay lại sau nhé.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-500">
            {formatVnd(meta.total)} sản phẩm đang có hoa hồng
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden bg-gray-100">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <Store size={28} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-800" title={p.name}>
                    {p.name}
                  </h3>
                  {p.shop && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{p.shop.name}</p>
                  )}

                  <div className="mt-2 text-sm font-semibold text-gray-800">
                    {formatVnd(p.price)}đ
                  </div>

                  {/* Số TIỀN đứng trước phần trăm: đó mới là thứ khiến người ta chia sẻ. */}
                  <div className="mt-1.5 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-700">
                    Hoa hồng{' '}
                    <span className="font-bold">{formatVnd(p.commissionPerUnit)}đ</span>
                    <span className="text-orange-500">
                      {' '}
                      ({(p.affiliateRate * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => getLink(p)}
                    disabled={creatingFor === p.id}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-orange py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Link2 size={14} />
                    {creatingFor === p.id ? 'Đang lấy…' : 'Lấy link'}
                  </button>
                </div>
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
        </>
      )}

      {modalLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Link tiếp thị"
          onClick={() => setModalLink(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Link tiếp thị của bạn</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                  {modalLink.product.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalLink(null)}
                aria-label="Đóng"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

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
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 hover:bg-gray-200"
              >
                {copied ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={copy}
              className="w-full rounded-lg bg-brand-orange py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              {copied ? 'Đã sao chép!' : 'Sao chép link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
