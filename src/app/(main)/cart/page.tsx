// src/app/(main)/cart/page.tsx
import CartPage from '@/modules/cart/CartPage';
import { Metadata } from 'next';

// Wiki 0104: tiêu đề trước đây là "Thanh toán" — nhưng đây là trang GIỎ HÀNG,
// thanh toán là `/checkout`. Tab trình duyệt báo sai bước khách đang đứng.
// `noindex`: giỏ hàng là dữ liệu riêng của từng người, không có gì để Google lập chỉ mục.
export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Xem lại sản phẩm trong giỏ hàng của bạn trước khi đặt mua.',
  robots: { index: false, follow: true },
};

// Bắt buộc render động vì trang giỏ hàng phụ thuộc dữ liệu user/local storage
export const dynamic = "force-dynamic";

export default function Page() {
  return <CartPage />;
}