// src/app/(auth)/layout.tsx
import SimpleHeader from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

// Wiki 0104: `/login` và `/register` trước đây ra HTML KHÔNG có thẻ `<title>` (root
// layout trống metadata, trang cũng không khai) → tab trình duyệt chỉ hiện "gmall.vn".
// Các trang này là biểu mẫu tài khoản, không có nội dung để lập chỉ mục → `noindex`,
// nhưng vẫn `follow` để crawler đi tiếp các link trong header/footer.
export const metadata: Metadata = {
  title: { default: 'Tài khoản', template: '%s | GMall' },
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 1. Header tối giản */}
      <SimpleHeader />

      {/* 2. Nội dung chính (Form login/register) */}
      <main className="flex-grow">
        {children}
      </main>

      {/* 3. Footer đầy đủ (Tái sử dụng từ trang chủ) */}
      <Footer />
    </div>
  );
}