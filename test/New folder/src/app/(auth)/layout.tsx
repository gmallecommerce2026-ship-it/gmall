// src/app/(auth)/layout.tsx
import SimpleHeader from '@/components/layout/SimpleHeader';
import Footer from '@/components/layout/Footer';

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