// src/app/(blog)/blog/page.tsx
import React, { Suspense } from 'react';
import BlogClient from './blogClient';
import { Metadata } from 'next';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Tạp Chí Đời Sống & Cẩm Nang Mua Sắm | G-Mall',
  description: 'Khám phá các bài viết mới nhất về phong cách sống, mẹo mua sắm, review sản phẩm và hướng dẫn sử dụng từ G-Mall.',
  keywords: ['blog', 'tin tức', 'cẩm nang', 'mua sắm', 'review'],
  openGraph: {
    title: 'Tạp Chí Đời Sống - G-Mall',
    description: 'Nơi chia sẻ kiến thức và trải nghiệm mua sắm.',
    type: 'website',
  },
};

export default function ContentPage() {
  return (
    <Suspense fallback={<div>Đang tải nội dung...</div>}>
      <BlogClient />
    </Suspense>
  );
}