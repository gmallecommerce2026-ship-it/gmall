// src/app/(main)/search/page.tsx
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SearchProductPage from '@/modules/product/SearchProductPage';

// OCD Note: Force dynamic vì trang này phụ thuộc searchParams
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm | Tên Shop Của Bạn',
  description: 'Kết quả tìm kiếm sản phẩm chất lượng cao.',
  robots: 'noindex, follow', // Best practice: Tránh Google index các trang kết quả tìm kiếm rác
};

// OCD Note: Bọc Suspense là BẮT BUỘC khi dùng useSearchParams trong Next.js App Router
// để tránh lỗi de-opt toàn bộ trang về client-side rendering block.
export default function Page() {
  return (
    <Suspense fallback={
        <div className="w-full h-screen flex justify-center items-center bg-gray-50">
             <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
    }>
      <SearchProductPage />
    </Suspense>
  );
}