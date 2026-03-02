// src/app/(admin)/admin/products/page.tsx
import React, { Suspense } from 'react';
import ProductsClient from './ProductsClient';

// Bắt buộc render động để tránh lỗi Prerender với Client Component vì dữ liệu thay đổi liên tục
export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }>
        <ProductsClient />
      </Suspense>
    </div>
  );
}