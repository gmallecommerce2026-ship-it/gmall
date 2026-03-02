import ProductDetailsPage from '@/modules/product-details/ProductDetailsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi tiết sản phẩm',
  description: 'Thông tin chi tiết về sản phẩm.',
};

// Thêm dòng này để tránh lỗi build prerender nếu có dữ liệu động ngầm
export const dynamic = "force-dynamic";

export default function Page() {
  return <ProductDetailsPage />;
}