import React from 'react';
import type { Metadata } from 'next';
import HomeClient from './homeClient';
import { apiClient } from "@/lib/api/ApiClient";

// Wiki 0104: trang chủ là trang được share và lập chỉ mục nhiều nhất, mà trước đây
// KHÔNG có thẻ title/description/og nào (root layout cũng trống). Khai riêng ở đây
// để trang chủ có mô tả và ảnh preview của chính nó, không dùng chung mẫu `%s | GMall`.
export const metadata: Metadata = {
  title: {
    absolute: 'GMall — Nền tảng quà tặng & mua sắm trực tuyến',
  },
  description:
    'Mua quà tặng và hàng chính hãng trên GMall: gợi ý quà theo dịp, gói quà tận tâm, ' +
    'giao nhanh toàn quốc. Mỗi đơn hàng đóng góp 1% cho quỹ từ thiện.',
  alternates: { canonical: '/' },
};

// Wiki 0032 attempt: muốn ISR `revalidate=60` nhưng axios `apiClient` mặc định
// gửi `cache: 'no-store'` → Next.js bail out static. Refactor sang native fetch
// là scope lớn — skip. Dựa vào BE Redis cache (TTL 30s) + PM2 cluster
// (12 worker) — combo đủ đẩy throughput từ 10 → 100+ req/s.
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    // Gọi API song song: Layout, Products, FlashSale và Banner trang chủ
    const [layoutRes, suggestedRes, flashSaleRes, bannersRes] = await Promise.all([
      apiClient.get('/home-settings/layout'),
      // #19: "Gợi Ý Hôm Nay" — sort theo salesCount (popular) thay vì 'random'
      // hay createdAt DESC (newest). BE đã hỗ trợ `sort=sales` (xem
      // product-read.service.ts) — chỉ cần truyền đúng tham số. Lấy 30 SP để
      // có dư cho FE phân trang inline (#18).
      apiClient.get('/store/products', { params: { limit: 30, sort: 'sales' } }),
      apiClient.get('/store/flash-sale/current').catch((err) => {
          console.error("[Trang chủ] Không lấy được Flash Sale:", err?.response?.data || err?.message || err);
          return null;
      }),
      // Wiki 0104: banner trang chủ do admin tải lên qua CMS (`location=HOMEPAGE`).
      // TRƯỚC ĐÂY KHÔNG TRANG NÀO ĐỌC vị trí này — khách đã tải lên banner thiết kế
      // thật ("Quà tặng cho phụ nữ") mà nó nằm im trong DB, trong khi trang chủ chạy
      // ảnh stock Unsplash demo. Lỗi hỏng phải nằm ở FE chứ không phải ở dữ liệu.
      apiClient.get('/content/banners', { params: { location: 'HOMEPAGE' } }).catch((err) => {
          console.error("[Trang chủ] Không lấy được banner:", err?.response?.data || err?.message || err);
          return null;
      })
    ]);

    const layoutData = Array.isArray(layoutRes) ? layoutRes : (layoutRes?.data || []);
    const suggestedData = Array.isArray(suggestedRes?.data) ? suggestedRes.data : (suggestedRes?.data?.items || []);
    const flashSaleData = flashSaleRes?.data || flashSaleRes; // Lấy data FlashSale
    const bannersData = Array.isArray(bannersRes) ? bannersRes : (bannersRes?.data || []);

    return {
      dynamicSections: layoutData,
      suggestedProducts: suggestedData,
      flashSaleData: flashSaleData, // Trả về
      heroBanners: bannersData,
    };
  } catch (error) {
    console.error("[Trang chủ] Lỗi tải dữ liệu:", error);
    return { dynamicSections: [], suggestedProducts: [], flashSaleData: null, heroBanners: [] };
  }
}

export default async function ContentPage() {
  const { dynamicSections, suggestedProducts, flashSaleData, heroBanners } = await getHomePageData();

  return (
    <>
      {/* Wiki 0104: trang chủ không có `<h1>` nào — heading nhảy thẳng vào h2/h3.
          Google dùng h1 để hiểu chủ đề trang, trình đọc màn hình dùng nó để định vị.
          Dùng `sr-only` để thêm mốc ngữ nghĩa mà KHÔNG đụng tới bố cục đang chạy. */}
      <h1 className="sr-only">GMall — Nền tảng quà tặng và mua sắm trực tuyến</h1>
      <HomeClient
        initialSections={dynamicSections}
        suggestedProducts={suggestedProducts}
        flashSaleData={flashSaleData} // Truyền xuống Client
        heroBanners={heroBanners}
      />
    </>
  );
}