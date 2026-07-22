// src/modules/product/components/PromoBanner.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

// Banner ads cho trang danh sách sản phẩm / category.
// Đọc từ Banner table với location='PRODUCT_LIST' (đổi lại đúng giá trị
// admin đang dùng trong ContentClient nếu khác).

interface BannerItem {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

const PROMO_BANNER_LOCATION = 'PRODUCT_LIST'; // TODO: xác nhận lại giá trị đúng với admin

const PromoBanner = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<BannerItem[]>(`/content/banners?location=${PROMO_BANNER_LOCATION}`)
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto rotate 5s nếu có > 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  // Đang tải: giữ khung skeleton để tránh layout shift
  if (loading) {
    return <div className="bg-gray-100 rounded-2xl w-full h-64 mt-8 animate-pulse" />;
  }

  // Không có banner nào được set trong admin -> ẩn hẳn khu vực này
  if (banners.length === 0) return null;

  const b = banners[idx];

  const inner = (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50 mt-8">
      <img
        src={b.src}
        alt={b.alt || b.title || 'Quảng cáo'}
        className="w-full h-64 object-cover"
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

export default PromoBanner;