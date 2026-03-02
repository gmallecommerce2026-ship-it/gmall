// src/app/(admin)/admin/content/page.tsx
import React, { Suspense } from 'react';
import PaymentSuccessClient from './paymentSuccessClient';

// Bắt buộc render động để tránh lỗi Prerender với Client Component
export const dynamic = "force-dynamic";

export default function ContentPage() {
  return (
    <Suspense fallback={<div>Đang tải nội dung...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}