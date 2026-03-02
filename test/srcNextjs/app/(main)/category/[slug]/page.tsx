// src/app/(main)/category/[slug]/page.tsx
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SearchProductPage from '@/modules/product/SearchProductPage';

// Component Loading dự phòng
const LoadingFallback = () => (
  <div className="w-full h-screen flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

// Tạo Metadata động
export async function generateMetadata({ params }: any): Promise<Metadata> {
  // [Next.js 15 Fix] Await params trước khi dùng
  const resolvedParams = await params; 
  const slug = resolvedParams.slug;

  const title = slug
    ?.split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | G-Mall`,
    description: `Mua sắm ${title} giá tốt tại G-Mall`,
  };
}

// Page chính
export default async function CategoryPage({ params }: any) {
  // [Next.js 15 Fix] Await params
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return (
    // [QUAN TRỌNG] Bắt buộc phải có Suspense vì SearchProductPage dùng useSearchParams
    <Suspense fallback={<LoadingFallback />}>
      <SearchProductPage initialCategorySlug={slug} />
    </Suspense>
  );
}