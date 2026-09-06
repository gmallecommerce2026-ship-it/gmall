// src/services/category.server.ts
//
// Đường lấy DANH MỤC chạy TRÊN SERVER (dùng cho `generateMetadata` của /category/[slug]).
// Xem docs/wiki/decisions/0104-soat-chat-luong-truoc-ban-giao.md
//
// Vì sao cần: trước đây tiêu đề trang danh mục được suy ra từ chính slug
// (`'do-choi' → 'Do Choi'`). Slug đã bỏ dấu tiếng Việt nên tiêu đề ra "Do Choi",
// "Danh Cho Me Va Be" — vừa sai chính tả vừa là thứ Google đem đi lập chỉ mục.
// Tên thật nằm ở BE (`GET /categories/slug/:slug` → `{ id, name, slug, ... }`).
//
// Không tái dùng `apiClient`/`api` vì cùng lý do đã ghi ở `product.server.ts`
// (nhánh 401 đụng `window`, hoặc kéo theo store + interceptor cho endpoint công khai).

import { cache } from 'react';
import { API_BASE_URL } from '@/lib/api/config';

const FETCH_TIMEOUT_MS = 5_000;

/** Xem giải thích đầy đủ ở `product.server.ts`: URL nội bộ nhanh hơn ~50 lần trên VPS. */
const SERVER_API_BASE = (process.env.API_INTERNAL_URL || API_BASE_URL).replace(/\/$/, '');

export type CategoryLite = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Lấy danh mục theo slug để dựng metadata.
 *
 * KHÁC `getProductDetail` một điểm CÓ CHỦ Ý: ở đây **không throw**. Với trang chi tiết
 * sản phẩm, sản phẩm CHÍNH LÀ nội dung trang nên BE lỗi thì phải báo lỗi. Còn ở đây
 * dữ liệu chỉ dùng cho thẻ `<title>`; danh sách sản phẩm do component phía client tự
 * tải. Nếu để lỗi lan ra thì một BE chậm sẽ làm **trắng cả trang danh mục** chỉ vì
 * không lấy được cái tên — đánh đổi tệ. Lỗi → trả `null` → caller lùi về tên suy từ slug.
 */
export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryLite | null> => {
  if (!slug) return null;

  const url = `${SERVER_API_BASE}/categories/slug/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Tên danh mục gần như không đổi → cho phép Next cache 1 giờ, đỡ một lượt gọi BE
      // trên mỗi lần render trang danh mục.
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const raw = (await res.json().catch(() => null)) as any;
    if (!raw || typeof raw.name !== 'string' || !raw.name.trim()) return null;

    return { id: raw.id, name: raw.name.trim(), slug: raw.slug || slug };
  } catch {
    // Nuốt có chủ ý: xem giải thích ở doc-comment phía trên.
    return null;
  }
});

/**
 * Tên hiển thị dự phòng khi không lấy được danh mục thật.
 *
 * Vẫn mất dấu tiếng Việt (slug vốn đã bỏ dấu) nên CHỈ dùng làm phương án cuối,
 * không phải đường đi chính.
 */
export function titleFromSlug(slug: string): string {
  return (slug || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
