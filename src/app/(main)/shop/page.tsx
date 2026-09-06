// src/app/(main)/shop/page.tsx
import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ShopClient from './shopClient';

// wiki 0108: file này trước đây tên hàm là `ContentPage` và comment đầu file ghi
// `src/app/(admin)/admin/content/page.tsx` — dấu vết copy-paste từ trang khác. Đổi lại
// cho đúng, và bổ sung metadata: trang này trước đó không khai title nên tab trình duyệt
// chỉ hiện tên site (cùng lớp lỗi wiki 0104).
export const metadata: Metadata = {
  title: 'Gian hàng',
  description: 'Danh bạ các gian hàng đang hoạt động trên GMall — tìm shop theo tên và xem sản phẩm của họ.',
};

// Bắt buộc render động để tránh lỗi Prerender với Client Component
export const dynamic = 'force-dynamic';

export default function ShopDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Đang tải">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand-orange" />
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
