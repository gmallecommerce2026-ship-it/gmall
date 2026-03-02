// src/modules/payment/PaymentSuccessPage.tsx
"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useTracking, EventType } from '@/hooks/useTracking'; // Import

const PaymentSuccessPage = () => {
  const { track } = useTracking();

  useEffect(() => {
    // Track sự kiện View Success Page
    // Lưu ý: Doanh thu thực tế nên được track từ Backend (OrderController) để chính xác 100%
    track(EventType.VIEW_ORDER_SUCCESS, 'checkout_success', {
      status: 'success'
    });
  }, [track]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg shadow-gray-100 max-w-md w-full text-center border border-gray-100 animate-in fade-in zoom-in duration-500">
        
        {/* Icon Thành công */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-green-500">
             <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
           </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-be-vietnam-pro">
          Đặt hàng thành công!
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          Cảm ơn bạn đã mua sắm tại <span className="font-bold text-brand-orange">LoveGifts</span>. 
          Đơn hàng đang được xử lý.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full py-3.5 text-base shadow-lg shadow-orange-200">
              Tiếp tục mua sắm
            </Button>
          </Link>
          <Link href="/orders" className="w-full">
            <Button variant="secondary" className="w-full py-3.5 text-base bg-white border border-gray-200 hover:bg-gray-50 text-gray-600">
              Xem đơn hàng của tôi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;