// src/services/shop.server.ts
//
// Đường lấy HỒ SƠ GIAN HÀNG chạy TRÊN SERVER (dùng cho `generateMetadata` của /shop/[id]).
// Xem docs/wiki/decisions/0104-soat-chat-luong-truoc-ban-giao.md (đợt 5).
//
// Vì sao cần: `app/(main)/shop/[id]/page.tsx` là `"use client"` nên **không thể** khai
// metadata. Hệ quả đo được trên prod: mở trang gian hàng "Mẹ và Bé" (512 sản phẩm) mà
// thẻ `<title>` lại là tiêu đề mặc định của trang chủ, HTML thô **0 link sản phẩm**.
// Chia sẻ link gian hàng lên Zalo/Facebook không ra tên shop; Google thấy trang rỗng.
//
// Không tái dùng `apiClient`/`api` vì cùng lý do đã ghi ở `product.server.ts`
// (nhánh 401 đụng `window`, hoặc kéo theo store + interceptor cho endpoint công khai).

import { cache } from 'react';
import { API_BASE_URL } from '@/lib/api/config';

const FETCH_TIMEOUT_MS = 5_000;

/** Xem giải thích đầy đủ ở `product.server.ts`: URL nội bộ nhanh hơn ~50 lần trên VPS. */
const SERVER_API_BASE = (process.env.API_INTERNAL_URL || API_BASE_URL).replace(/\/$/, '');

export type ShopProfileLite = {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  totalProducts?: number | null;
};

/**
 * Lấy hồ sơ gian hàng theo id.
 *
 * KHÔNG throw — giống `category.server.ts` và khác `product.server.ts` một cách CÓ CHỦ Ý:
 * dữ liệu ở đây chỉ dùng cho thẻ `<title>`/`og:*`, còn nội dung trang do component phía
 * client tự tải. Để lỗi lan ra thì một BE chậm sẽ làm **trắng cả trang gian hàng** chỉ vì
 * không lấy được cái tên — đánh đổi tệ. Lỗi → `null` → caller dùng tiêu đề chung.
 */
export const getShopProfile = cache(async (shopId: string): Promise<ShopProfileLite | null> => {
  if (!shopId) return null;

  const url = `${SERVER_API_BASE}/shops/${encodeURIComponent(shopId)}/profile`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Tên/mô tả gian hàng gần như không đổi → cho phép Next cache 10 phút.
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const raw = (await res.json().catch(() => null)) as any;
    if (!raw || typeof raw.name !== 'string' || !raw.name.trim()) return null;

    return {
      id: raw.id,
      name: raw.name.trim(),
      description: raw.description ?? null,
      avatar: raw.avatar ?? null,
      totalProducts: raw.totalProducts ?? raw._count?.products ?? null,
    };
  } catch {
    // Nuốt có chủ ý: xem giải thích ở doc-comment phía trên.
    return null;
  }
});
