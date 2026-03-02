// src/app/(main)/cart/page.tsx
import CartPage from '@/modules/cart/CartPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Hoàn tất đơn hàng của bạn.',
};

// Bắt buộc render động vì trang giỏ hàng phụ thuộc dữ liệu user/local storage
export const dynamic = "force-dynamic";

export default function Page() {
  return <CartPage />;
}