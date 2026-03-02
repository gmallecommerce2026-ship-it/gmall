// src/app/(main)/search/page.tsx

import React from 'react';
import SearchProductPage from '@/modules/product/SearchProductPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm',
  description: 'Kết quả tìm kiếm sản phẩm',
};

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ searchParams }: SearchPageProps) {
  // [FIX] Lấy đầy đủ các param quan trọng
  const searchKeyword = typeof searchParams.q === 'string' ? searchParams.q : '';
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : '';
  const categorySlug = typeof searchParams.categorySlug === 'string' ? searchParams.categorySlug : '';

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