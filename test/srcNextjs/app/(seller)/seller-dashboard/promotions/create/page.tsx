import React, { Suspense } from 'react';
import CreateVoucherClient from './CreateVoucherClient';

// [QUAN TRỌNG] Metadata chỉ hoạt động ở Server Component
export const metadata = {
  title: 'Tạo mã giảm giá | Kênh người bán',
  description: 'Tạo chương trình khuyến mãi mới',
};

// [QUAN TRỌNG] Fix lỗi build bằng cách ép kiểu Dynamic Rendering
export const dynamic = 'force-dynamic';

export default function CreateVoucherPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Đang tải form...</div>}>
      <CreateVoucherClient />
    </Suspense>
  );
}