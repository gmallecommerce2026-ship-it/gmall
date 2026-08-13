// src/app/(main)/category/[slug]/page.tsx
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SearchProductPage from '@/modules/product/SearchProductPage';
import { getCategoryBySlug, titleFromSlug } from '@/services/category.server';

// Component Loading dự phòng
const LoadingFallback = () => (
  <div className="w-full h-screen flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

// Tạo Metadata động
//
// Wiki 0104: trước đây tiêu đề được suy ra từ SLUG (`'do-choi' → 'Do Choi'`). Slug đã
// bỏ dấu tiếng Việt nên mọi trang danh mục — bề mặt duyệt hàng chính của một sàn TMĐT —
// đều mang tiêu đề sai chính tả và Google lập chỉ mục đúng cái sai đó
// ("Danh Cho Me Va Be" thay vì "Dành cho Mẹ và Bé"). Nay lấy TÊN THẬT từ BE.
//
// Cũng bỏ hậu tố "| G-Mall" viết tay: root layout đã có `title.template = '%s | GMall'`
// nên viết lại ở đây sẽ ra "... | G-Mall | GMall" và tiếp tục làm lệch tên thương hiệu.
export async function generateMetadata({ params }: any): Promise<Metadata> {
  // [Next.js 15 Fix] Await params trước khi dùng
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const category = await getCategoryBySlug(slug);
  const name = category?.name || titleFromSlug(slug);

  return {
    title: name,
    description: `Mua ${name} chính hãng, giá tốt tại GMall. Giao nhanh toàn quốc, hỗ trợ gói quà.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${name} | GMall`,
      description: `Khám phá ${name} trên GMall.`,
      url: `/category/${slug}`,
    },
  };
}

// Page chính
export default async function CategoryPage({ params }: any) {
  // [Next.js 15 Fix] Await params
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Wiki 0104 (đợt 2): lấy sẵn tên danh mục ở server để tiêu đề `<h1>` có mặt NGAY
  // trong HTML đầu tiên. Trước đây tên chỉ có sau `useEffect`, nên tiêu đề hiện ra là
  // "DANH MỤC:" cụt lủn. `getCategoryBySlug` được bọc `cache()` nên lời gọi này dùng
  // chung kết quả với `generateMetadata` ở trên — không phát sinh thêm request.
  const category = await getCategoryBySlug(slug);

  return (
    // [QUAN TRỌNG] Bắt buộc phải có Suspense vì SearchProductPage dùng useSearchParams
    <Suspense fallback={<LoadingFallback />}>
      <SearchProductPage initialCategorySlug={slug} initialCategoryName={category?.name} />
    </Suspense>
  );
}