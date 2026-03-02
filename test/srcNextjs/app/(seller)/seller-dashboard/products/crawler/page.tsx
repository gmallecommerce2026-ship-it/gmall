// src/app/(seller)/seller-dashboard/products/crawler/page.tsx
import React from 'react';
import ShopeeCrawlerPage from '@/modules/seller/crawler/ShopeeCrawlerPage'; // Import component bạn vừa tạo

export const metadata = {
  title: 'Crawl Sản phẩm Shopee (Beta) | Seller Dashboard',
  description: 'Công cụ hỗ trợ đăng sản phẩm nhanh từ Shopee',
};

export default function CrawlerRoutePage() {
  return (
    <div className="h-full w-full bg-gray-50 min-h-screen">
      {/* Gọi component giao diện chính ở đây */}
      <ShopeeCrawlerPage />
    </div>
  );
}