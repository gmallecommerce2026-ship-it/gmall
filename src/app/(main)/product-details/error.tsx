'use client';

// src/app/(main)/product-details/error.tsx
//
// Khi việc lấy sản phẩm hỏng vì lý do KHÁC 404 (BE sập, timeout, 5xx), server component
// throw thay vì nuốt lỗi — request trả 5xx đúng ngữ nghĩa "thử lại sau" cho crawler.
// Boundary này đảm bảo người dùng thấy thông báo tử tế + nút thử lại chứ không phải trang
// lỗi trần của Next. Trước khi chuyển sang server component, vai trò này do state `error`
// thủ công trong client component đảm nhiệm.
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ProductDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[product-details] Render lỗi:', error);
  }, [error]);

  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center text-gray-500 px-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tải được sản phẩm</h2>
      <p className="mb-6">Đường truyền hoặc máy chủ đang trục trặc. Vui lòng thử lại.</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-brand-orange text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-all"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
