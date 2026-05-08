// src/app/(main)/search/page.tsx

import React from 'react';
import SearchProductPage from '@/modules/product/SearchProductPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm',
  description: 'Kết quả tìm kiếm sản phẩm',
};

// TS-fix wiki 0031: Next 15+ — searchParams là Promise
interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  // [FIX] Lấy đầy đủ các param quan trọng
  const searchKeyword = typeof sp.q === 'string' ? sp.q : '';
  const tag = typeof sp.tag === 'string' ? sp.tag : '';
  const categorySlug = typeof sp.categorySlug === 'string' ? sp.categorySlug : '';

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchProductPage 
          initialKeyword={searchKeyword} 
          initialTag={tag} 
          initialCategorySlug={categorySlug} // [QUAN TRỌNG] Truyền slug xuống
      />
    </div>
  );
}