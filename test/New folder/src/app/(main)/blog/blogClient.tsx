import BlogPage from '@/modules/blog/BlogPage';
import { Metadata } from 'next';

// Tùy chọn: Thêm metadata cho trang
export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Hoàn tất đơn hàng của bạn.',
};

// Thêm dòng này
export const dynamic = "force-dynamic";

/**
 * Đây là file ĐỊNH NGHĨA ROUTE của Next.js.
 * Nhiệm vụ của nó RẤT ĐƠN GIẢN:
 * Chỉ import và hiển thị component "PaymentPage" thật
 * đã được định nghĩa ở "src/modules/payment/".
 */
export default function BlogClient() {
  return <BlogPage />;
}