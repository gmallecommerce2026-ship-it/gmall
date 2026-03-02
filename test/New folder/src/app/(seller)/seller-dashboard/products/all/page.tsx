// src/app/(seller)/seller-dashboard/products/all/page.tsx
import React from 'react';
import ProductManagementPage from '@/modules/seller/products/ProductManagementPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tất cả sản phẩm | Kênh người bán',
  description: 'Quản lý danh sách sản phẩm của cửa hàng',
};

const AllProductsRoute = () => {
  return <ProductManagementPage />;
};

export default AllProductsRoute;