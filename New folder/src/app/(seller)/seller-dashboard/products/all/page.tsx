import React, { Suspense } from 'react';
import ProductManagementPage from '@/modules/seller/products/ProductManagementPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tất cả sản phẩm | Kênh người bán',
  description: 'Quản lý danh sách sản phẩm của cửa hàng',
};

// [FIX LỖI BUILD] Chuyển sang Dynamic Rendering
// Bắt buộc render mỗi khi request, tránh lỗi "useSearchParams... csr-bailout"
export const dynamic = 'force-dynamic';

const AllProductsRoute = () => {
  return (
    // Bọc Suspense để đảm bảo an toàn cho các hook client-side
    <Suspense fallback={<div className="flex justify-center p-10">Đang tải danh sách...</div>}>
      <ProductManagementPage />
    </Suspense>
  );
};

export default AllProductsRoute;