// src/app/(admin)/admin/shops/AdminShopClient.tsx
'use client';

// Wiki 0104 — trang này TRƯỚC ĐÂY hiển thị 4 cửa hàng BỊA (`MOCK_SHOPS`: "Love Gifts
// Official", "Phụ Kiện Xinh", "Gốm Sứ Bát Tràng", "Tiệm Hoa Khô") và KHÔNG gọi API lần
// nào; hai nút "Xem shop"/"Quản lý" cũng không gắn hành vi. Với một màn hình quản trị
// sắp bàn giao, đó là dữ liệu sai trình bày như dữ liệu thật.
//
// Vì sao lấy từ `GET /shops` chứ không phải `GET /admin/shops`:
// `AdminService.getShops()` gọi `/admin/shops` kèm comment "TODO: Implement Backend" —
// đo trên prod thì endpoint đó trả **404**, tức chưa bao giờ tồn tại. `/shops` là
// endpoint CÓ THẬT (đã đo), trả `{ data, meta }` với các trường `id, name, avatar, slug`.
//
// CỐ Ý bỏ 3 ô "Đánh giá / Số sản phẩm / Kho hàng" của bản cũ: `/shops` không trả những
// dữ liệu đó. Hiện ít trường THẬT vẫn tốt hơn hiện đủ ô bằng số bịa — người quản trị
// sẽ ra quyết định dựa trên những con số này.

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiInfo, FiExternalLink } from 'react-icons/fi';
import { apiClient } from '@/lib/api/ApiClient';

type ShopItem = {
  id: string;
  name: string;
  avatar?: string | null;
  slug?: string | null;
};

/** Chữ cái đầu dùng làm ảnh đại diện dự phòng khi shop chưa có avatar. */
function initials(name: string): string {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ShopClient() {
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiClient.get('/shops', { params: { limit: 60 } });
      // `apiClient` trả THẲNG body JSON (không bọc `{data}` như axios) — xem
      // [[reference_apiclient_no_data_wrapper]]. Body của `/shops` là `{ data, meta }`.
      const list = Array.isArray(res) ? res : res?.data;
      if (!Array.isArray(list)) {
        setShops([]);
        setError('Máy chủ trả về dữ liệu không đúng định dạng.');
        return;
      }
      setShops(list);
    } catch (e) {
      console.error('[Admin/Shops] Không tải được danh sách cửa hàng:', e);
      setShops([]);
      setError('Không tải được danh sách cửa hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cửa hàng đang hoạt động</h1>
        {!loading && !error && (
          <span className="text-sm text-gray-500">{shops.length} cửa hàng</span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiInfo className="mt-0.5 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            onClick={fetchShops}
            className="shrink-0 rounded border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 hover:bg-red-100"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-8 animate-pulse rounded bg-gray-50" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && shops.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center">
          <FiShoppingBag className="mx-auto mb-3 text-3xl text-gray-300" />
          <p className="font-medium text-gray-600">Chưa có cửa hàng nào</p>
          <p className="mt-1 text-sm text-gray-400">
            Cửa hàng sẽ xuất hiện ở đây sau khi người bán đăng ký và được duyệt.
          </p>
        </div>
      )}

      {!loading && shops.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="group rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-4">
                {shop.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shop.avatar}
                    alt={shop.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-[#E78720]">
                    {initials(shop.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-gray-800 transition-colors group-hover:text-[#E78720]">
                    {shop.name}
                  </h3>
                  {shop.slug && (
                    <span className="block truncate text-xs text-gray-400">/{shop.slug}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-50 pt-4">
                <Link
                  href={`/shop/${shop.id}`}
                  target="_blank"
                  className="flex flex-1 items-center justify-center gap-1 rounded bg-gray-50 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Xem shop <FiExternalLink size={12} />
                </Link>
                <Link
                  href={`/admin/shops/${shop.id}`}
                  className="flex-1 rounded bg-[#E78720]/10 py-2 text-center text-xs font-medium text-[#E78720] hover:bg-[#E78720]/20"
                >
                  Quản lý
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
