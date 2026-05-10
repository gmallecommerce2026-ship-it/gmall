'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

// #22 (wiki 0044/0045/0046): brand chips dưới banner ở product detail.
// Hiển brand thuộc cùng category (recursive descendant) với SP đang xem.
// BE endpoint: GET /brands?categoryId=X&limit=12 — sort theo productCount DESC.
// Skip render nếu không có brand hoặc không có categoryId.

interface BrandChip {
  id: number;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  productCount?: number;
}

interface Props {
  categoryId?: string | null;
}

const RelatedBrands: React.FC<Props> = ({ categoryId }) => {
  const [brands, setBrands] = useState<BrandChip[]>([]);

  useEffect(() => {
    if (!categoryId) return;
    api.get<BrandChip[]>(`/brands?categoryId=${encodeURIComponent(categoryId)}&limit=12`)
      .then((res) => setBrands(Array.isArray(res) ? res : []))
      .catch(() => setBrands([]));
  }, [categoryId]);

  if (!categoryId || brands.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Thương hiệu cùng danh mục</h3>
      <div className="flex flex-wrap gap-2">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/search?brandId=${b.id}`}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:border-brand-orange hover:text-brand-orange hover:bg-orange-50 transition-all text-sm"
            title={b.productCount ? `${b.productCount} sản phẩm` : undefined}
          >
            {b.logoUrl && (
              <img
                src={b.logoUrl}
                alt={b.name}
                className="w-5 h-5 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <span className="font-medium text-gray-700">{b.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedBrands;
