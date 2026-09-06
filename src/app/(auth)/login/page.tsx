// src/app/(auth)/login/page.tsx
import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginClient from './loginClient';

// Wiki 0104: trang này trước đây KHÔNG khai metadata và root layout cũng trống
// → HTML ra không có thẻ <title>, tab trình duyệt chỉ hiện "gmall.vn".
// `(auth)/layout.tsx` đã đặt `robots: noindex` cho cả nhóm.
export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập tài khoản GMall để mua sắm, theo dõi đơn hàng và nhận ưu đãi riêng.',
};

// Bắt buộc render động để tránh lỗi Prerender với Client Component
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    // Fallback cũ là câu chữ trần không khung, nhảy giật giữa trang.
    // Thay bằng vùng giữ chỗ căn giữa cùng chiều cao với khối biểu mẫu.
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Đang tải">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand-orange" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
