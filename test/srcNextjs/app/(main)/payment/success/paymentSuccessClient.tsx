// src/app/(main)/payment/success/paymentSuccessClient.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentSuccessPage from '@/modules/payment/PaymentSuccessPage';

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  
  const orderCode = 
    searchParams.get('orderId') || 
    searchParams.get('id') || 
    searchParams.get('orderCode') || 
    ''; 

  return <PaymentSuccessPage orderCode={orderCode} />;
}