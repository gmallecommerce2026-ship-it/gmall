import React from 'react';
import HomeClient from './homeClient';
import { apiClient } from "@/lib/api/ApiClient";

// Wiki 0032 attempt: muốn ISR `revalidate=60` nhưng axios `apiClient` mặc định
// gửi `cache: 'no-store'` → Next.js bail out static. Refactor sang native fetch
// là scope lớn — skip. Dựa vào BE Redis cache (TTL 30s) + PM2 cluster
// (12 worker) — combo đủ đẩy throughput từ 10 → 100+ req/s.
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    console.log("🚀 [SERVER] Bắt đầu tải dữ liệu Home...");
    
    // Gọi API song song: Layout, Products, và FlashSale
    const [layoutRes, suggestedRes, flashSaleRes] = await Promise.all([
      apiClient.get('/home-settings/layout'),
      // #19: "Gợi Ý Hôm Nay" — sort theo salesCount (popular) thay vì 'random'
      // hay createdAt DESC (newest). BE đã hỗ trợ `sort=sales` (xem
      // product-read.service.ts) — chỉ cần truyền đúng tham số. Lấy 30 SP để
      // có dư cho FE phân trang inline (#18).
      apiClient.get('/store/products', { params: { limit: 30, sort: 'sales' } }),
      apiClient.get('/store/flash-sale/current').catch((err) => {
          console.error("🔥 [LỖI FLASH SALE]:", err.response || err.message); // Log rõ lỗi ra
          console.error("🔥 [LỖI FLASH SALE] 2:", err.response?.data || err.message); // Log rõ lỗi ra
          return null;
      }) 
    ]);

    const layoutData = Array.isArray(layoutRes) ? layoutRes : (layoutRes?.data || []);
    const suggestedData = Array.isArray(suggestedRes?.data) ? suggestedRes.data : (suggestedRes?.data?.items || []);
    const flashSaleData = flashSaleRes?.data || flashSaleRes; // Lấy data FlashSale
    
    return {
      dynamicSections: layoutData,
      suggestedProducts: suggestedData,
      flashSaleData: flashSaleData, // Trả về
    };
  } catch (error) {
    console.error("❌ [SERVER] Lỗi tải trang chủ:", error);
    return { dynamicSections: [], suggestedProducts: [], flashSaleData: null };
  }
}

export default async function ContentPage() {
  const { dynamicSections, suggestedProducts, flashSaleData } = await getHomePageData();

  return (
    <HomeClient 
      initialSections={dynamicSections} 
      suggestedProducts={suggestedProducts} 
      flashSaleData={flashSaleData} // Truyền xuống Client
    />
  );
}