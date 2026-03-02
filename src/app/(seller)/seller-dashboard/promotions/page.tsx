import React, { Suspense } from 'react';
import PromotionsClient from './PromotionsClient';

export const metadata = {
  title: 'Quản lý khuyến mãi | Kênh người bán',
  description: 'Danh sách các chương trình khuyến mãi của shop',
};

// [QUAN TRỌNG] Fix lỗi build: Ép buộc render động cho trang dashboard này
export const dynamic = 'force-dynamic';

export default function PromotionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Đang tải dữ liệu khuyến mãi...</div>}>
      <PromotionsClient />
    </Suspense>
  );
}