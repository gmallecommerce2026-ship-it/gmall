'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function SimpleHeader() {
  const pathname = usePathname();
  
  // Xác định tiêu đề dựa trên URL
  const getPageTitle = () => {
    if (pathname?.includes('/register')) return 'Đăng ký';
    if (pathname?.includes('/reset-password')) return 'Đặt lại mật khẩu';
    if (pathname?.includes('/forgot-password')) return 'Quên mật khẩu';
    return 'Đăng nhập';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo - Click quay về trang chủ */}
          <Link href="/" className="flex-shrink-0">
            {/* Bạn thay src bằng đường dẫn logo của bạn */}
            <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
               <span className="text-3xl">🛍️</span> Gmall
            </div>
          </Link>

          {/* Tiêu đề trang */}
          <div className="text-xl lg:text-2xl text-gray-900 font-medium pt-1">
            {getPageTitle()}
          </div>
        </div>

        {/* Link hỗ trợ bên phải (Optional).
            Wiki 0104: trước trỏ `/help` — route chưa bao giờ tồn tại → 404.
            Trung tâm trợ giúp thật nằm ở `/user/help`. */}
        <Link
          href="/user/help"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Bạn cần giúp đỡ?
        </Link>
      </div>
    </header>
  );
}