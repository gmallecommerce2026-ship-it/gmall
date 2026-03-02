// src/app/(routes)/payment/success/page.tsx
import React from 'react';
import { Metadata } from 'next';
import PaymentSuccessPage from '@/modules/payment/PaymentSuccessPage';

export const metadata: Metadata = {
  title: 'Thanh toán thành công | LoveGifts',
  description: 'Cảm ơn bạn đã mua sắm tại LoveGifts',
};

export default function PaymentSuccessClient() {
  return <PaymentSuccessPage />;
}