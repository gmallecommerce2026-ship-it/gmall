'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils'; // Giả sử bạn có hàm này

interface FlashSaleProps {
  data: {
    id: string;
    startTime: string;
    endTime: string;
    products: any[];
  } | null;
}

const FlashSaleSection: React.FC<FlashSaleProps> = ({ data }) => {
  // Fix BUG-FE-4 (wiki 0030): KHÔNG early-return TRƯỚC hooks. React track hooks
  // bằng order — render 1 (data null) chạy 0 hooks, render 2 (data có) chạy
  // useState+useEffect → "Rendered more hooks than during previous render" crash.
  // Đẩy guard xuống return JSX (sau hooks).
  // Fix BUG-FE-9: useState lazy init để SSR không render 00:00:00 rồi nhấp nháy.
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!data?.endTime) return { hours: 0, minutes: 0, seconds: 0 };
    const diff = new Date(data.endTime).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    if (!data?.endTime) return;
    const calculateTimeLeft = () => {
      const difference = new Date(data.endTime).getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [data?.endTime]);

  // Guard sau hooks — KHÔNG vi phạm Rules of Hooks
  if (!data || !data.products || data.products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Header: Title & Timer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center gap-4 mb-2 md:mb-0">
            <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xl uppercase italic">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-orange-600">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
              </svg>
              Flash Sale
            </div>
            
            {/* Countdown Timer Box */}
            <div className="flex items-center gap-1 font-mono text-sm font-bold">
              <span className="bg-black text-white px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span className="bg-black text-white px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span className="bg-black text-white px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <Link href="/flash-sale" className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1">
            Xem tất cả <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </Link>
        </div>

        {/* Product List - Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-4 p-4 pb-6 scrollbar-hide">
          {data.products.map((item: any) => {
            const percentSold = Math.round((item.sold / (item.sold + item.stock)) * 100) || 0;
            const discountPercent = Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100);

            return (
              <Link 
                key={item.id} 
                // 🔴 FIX: Đổi từ item.product.slug sang item.product.id
                href={`/product-details/${item.product.id}`}
                className="min-w-[180px] w-[180px] group cursor-pointer"
              >
                <div className="relative aspect-square rounded-md overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                   <Image
                    src={item.product.thumbnail || '/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-xs font-bold px-2 py-1">
                    -{discountPercent}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-orange-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice)}
                    </span>
                  </div>
                  
                  {/* Progress Bar Sold */}
                  <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden text-[10px] leading-4 text-center text-white font-bold uppercase">
                     {/* Thanh màu cam thể hiện % đã bán */}
                    <div 
                        className="absolute top-0 left-0 h-full bg-orange-500 z-0" 
                        style={{ width: `${percentSold > 10 ? percentSold : 10}%` }} // Min 10% để hiện chữ nếu cần
                    ></div>
                    {/* Text nằm đè lên trên */}
                    <span className="relative z-10 drop-shadow-md">
                        {item.stock === 0 ? 'Cháy hàng' : `Đã bán ${item.sold}`}
                    </span>
                    {/* Icon lửa nếu bán chạy > 80% */}
                    {percentSold > 80 && (
                        <div className="absolute top-0 left-1 z-20">🔥</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;