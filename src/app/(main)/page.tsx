import React from 'react';
import HomeClient from './homeClient';
import { apiClient } from "@/lib/api/ApiClient";
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    console.log("🚀 [SERVER] Bắt đầu tải dữ liệu Home...");
    
    // Gọi API song song: Layout, Products, và FlashSale
    const [layoutRes, suggestedRes, flashSaleRes] = await Promise.all([
      apiClient.get('/home-settings/layout'),
      apiClient.get('/store/products', { params: { limit: 18, sort: 'random' } }),
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