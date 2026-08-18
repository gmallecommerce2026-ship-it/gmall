import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import FinanceClient from './FinanceClient';

// wiki 0108: trang này TRƯỚC ĐÂY không tồn tại — `/seller-dashboard/finance` trả 404,
// dù backend đã có đủ `/seller/finance/wallet`, `/payouts`, `POST /payout` và chạy đúng.
// Hệ quả: người bán nhìn thấy tiền về ví nhưng **không có đường nào rút ra**.
export const metadata: Metadata = {
  title: 'Tài chính',
  description: 'Số dư ví, yêu cầu rút tiền và lịch sử rút tiền của người bán.',
};

export const dynamic = 'force-dynamic';

export default function SellerFinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Đang tải">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand-orange" />
        </div>
      }
    >
      <FinanceClient />
    </Suspense>
  );
}
