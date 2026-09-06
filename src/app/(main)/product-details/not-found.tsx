// src/app/(main)/product-details/not-found.tsx
//
// Đích của `notFound()` trong `[id]/page.tsx`. Đặt ở đây (không dùng `src/app/not-found.tsx`)
// để trang 404 sản phẩm vẫn nằm trong layout `(main)` — còn Header/Footer như bản client cũ,
// vốn render thông báo "Không tìm thấy sản phẩm" ngay bên trong `<main>`.
import React from 'react';
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center text-gray-500 px-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
      <p className="mb-6">Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
      <Link
        href="/"
        className="bg-brand-orange text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
