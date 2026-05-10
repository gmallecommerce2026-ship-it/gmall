'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

// #21 (wiki 0044/0045/0046): Banner ads trên product detail page.
// Đọc từ existing Banner table với location='PRODUCT_DETAIL' (admin tạo qua
// ContentClient). Render carousel đơn giản (1 banner/lần). Skip nếu không có.

interface BannerItem {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

const ProductDetailBanner = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get<BannerItem[]>('/content/banners?location=PRODUCT_DETAIL')
      .then(setBanners)
      .catch(() => setBanners([]));
  }, []);

  // Auto rotate 5s nếu có > 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const b = banners[idx];

  const inner = (
    <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">
      <img
        src={b.src}
        alt={b.alt || b.title || 'Quảng cáo'}
        className="w-full h-32 md:h-40 object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      {(b.title || b.ctaLabel) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center px-6">
          <div className="text-white">
            {b.title && <h3 className="text-lg md:text-2xl font-bold drop-shadow">{b.title}</h3>}
            {b.ctaLabel && (
              <span className="inline-block mt-2 bg-brand-orange px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
                {b.ctaLabel}
              </span>
            )}
          </div>
        </div>
      )}
      {banners.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {banners.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );

  return b.ctaLink ? <Link href={b.ctaLink}>{inner}</Link> : inner;
};

export default ProductDetailBanner;
