// src/services/product.server.ts
//
// Đường lấy CHI TIẾT SẢN PHẨM chạy TRÊN SERVER (React Server Component + generateMetadata).
// Xem docs/wiki/decisions/0101-product-details-server-component.md
//
// Vì sao KHÔNG tái dùng 2 client sẵn có:
//   - `apiClient` (src/lib/api/ApiClient.ts): nhánh 401 đọc `window.location`, ghi
//     localStorage rồi gán `window.location.href` — chạy ngoài trình duyệt là chết; nó cũng
//     gắn `credentials: 'include'` vốn vô nghĩa ở server.
//   - `api` (src/services/api.ts, axios): có guard `typeof window` nên không chết, nhưng kéo
//     theo `useUserStore` + interceptor logout cho một endpoint vốn `@Public()`.
//
// `/store/products/:id` không cần auth (BE: StoreProductController.getProductDetail), nên ở
// server dùng thẳng `fetch` — ít phụ thuộc nhất, kiểm soát được timeout và cache.

import { cache } from 'react';
import { API_BASE_URL } from '@/lib/api/config';
import type { Product } from '@/types/product';

/** Chặn một BE treo giữ luôn tiến trình SSR (không có timeout thì fetch của Node chờ vô hạn). */
const FETCH_TIMEOUT_MS = 8_000;

/**
 * Địa chỉ BE dùng cho lời gọi TỪ SERVER.
 *
 * `API_BASE_URL` là `NEXT_PUBLIC_API_URL` — địa chỉ dành cho TRÌNH DUYỆT. Trên VPS, FE và BE
 * chạy cùng máy, nên gọi qua URL công khai nghĩa là đi ra internet rồi vòng lại qua nginx +
 * bắt tay TLS: đo thực tế **166ms**, trong khi gọi thẳng `http://127.0.0.1:4001` chỉ **3ms**.
 * Chỗ này nằm trên đường tới TTFB của mọi trang sản phẩm, và còn khiến SSR phụ thuộc vào
 * nginx/chứng chỉ dù BE vẫn sống.
 *
 * `API_INTERNAL_URL` KHÔNG có tiền tố `NEXT_PUBLIC_` nên chỉ tồn tại phía server và đọc lúc
 * chạy — đổi giá trị không phải build lại. Không đặt thì tự lùi về URL công khai (dev local
 * không cần khai gì thêm).
 */
const SERVER_API_BASE = (process.env.API_INTERNAL_URL || API_BASE_URL).replace(/\/$/, '');

/** Response thô của `GET /store/products/:id` (BE `ProductReadService.findOnePublic`). */
type RawProductDetail = Record<string, any>;

/**
 * Map response thô của BE sang `Product`.
 *
 * Giữ NGUYÊN phép map mà client component cũ đang dùng — không thêm, không bớt trường — để
 * việc chuyển sang server component không đổi một pixel nào trên giao diện. Phần chuẩn hoá
 * còn lại (gộp ảnh theo tier, videos, variations) vẫn do
 * `ProductDetailsPage.normalizeProductData` đảm nhiệm y như trước.
 */
export function mapProductDetail(raw: RawProductDetail): Product {
  return {
    id: raw.id,
    title: raw.name,
    categoryId: raw.categoryId || raw.category?.id || null,

    slug: raw.slug || '',
    status: raw.status || 'ACTIVE',

    // --- GIÁ & GIẢM GIÁ ---
    price: Number(raw.price), // Giá bán hiện tại
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined, // Giá gốc (gạch ngang)
    regularPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined, // Alias dự phòng

    isDiscountActive: raw.isDiscountActive,
    discountType: raw.discountType,
    discountValue: raw.discountValue,
    discountPercent: raw.discountPercent,

    imageUrl: Array.isArray(raw.images)
      ? raw.images[0]?.url || raw.images[0]
      : '/assets/placeholder.png',
    images: Array.isArray(raw.images) ? raw.images.map((img: any) => img.url || img) : [],
    rating: raw.rating || 5.0,
    salesCount: raw.salesCount || 0,
    stockTotal: raw.stock,
    description: raw.description,
    shortDesc: raw.shortDesc || undefined,
    sellerId: raw.sellerId || raw.shopId,
    shopId: raw.shopId, // Alias
    tiers: raw.tiers || [],
    variants: raw.variants || [],
    attributes: raw.attributes
      ? typeof raw.attributes === 'string'
        ? JSON.parse(raw.attributes)
        : raw.attributes
      : {},

    brand: raw.brand || 'No Brand',
  } as Product;
}

/**
 * Lấy chi tiết sản phẩm theo id HOẶC slug (BE nhận cả hai).
 *
 * - Trả `null` khi sản phẩm không tồn tại / không ACTIVE (BE trả 404) → caller gọi `notFound()`.
 * - THROW khi BE lỗi hoặc không với tới được. Cố tình không nuốt thành `null`: biến một sự cố
 *   hạ tầng thành 404 sẽ khiến crawler hiểu nhầm là sản phẩm đã bị gỡ.
 *
 * Bọc `cache()` của React để `generateMetadata` và page dùng chung MỘT request trong cùng một
 * lượt render (kể cả khi `cache: 'no-store'` tắt Data Cache của Next).
 */
export const getProductDetail = cache(async (idOrSlug: string): Promise<Product | null> => {
  if (!idOrSlug) return null;

  const url = `${SERVER_API_BASE}/store/products/${encodeURIComponent(idOrSlug)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Giá và tồn kho là dữ liệu tiền — không cache HTML/JSON ở tầng Next. BE đã có Redis
      // cache TTL 30s cho đúng endpoint này (@CacheKey('store:product:detail')) nên gọi thẳng
      // vẫn rẻ, mà không cộng thêm một lớp cũ nữa lên giá đang hiển thị.
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(
      `[product.server] Không gọi được ${url}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`[product.server] ${url} trả về HTTP ${res.status}`);
  }

  const raw = (await res.json().catch(() => null)) as RawProductDetail | null;
  if (!raw || !raw.id) return null;

  return mapProductDetail(raw);
});
