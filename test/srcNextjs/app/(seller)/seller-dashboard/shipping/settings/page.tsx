import React, { Suspense } from 'react';
import ShippingSettingsPage from '@/modules/seller/shipping/ShippingSettingsPage';

export const metadata = {
  title: 'Cài đặt vận chuyển | Kênh người bán',
  description: 'Quản lý đơn vị vận chuyển và phí ship',
};

// [QUAN TRỌNG] Fix lỗi build: Chuyển sang Dynamic Rendering
// Giúp tránh lỗi "useSearchParams() ... csr-bailout"
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    // Bọc Suspense để xử lý các hook client-side bên trong ShippingSettingsPage
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Đang tải cài đặt vận chuyển...</div>}>
      <ShippingSettingsPage />
    </Suspense>
  );
}