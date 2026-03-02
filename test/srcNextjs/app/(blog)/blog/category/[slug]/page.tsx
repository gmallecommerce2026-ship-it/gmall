import React, { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { blogService } from '@/services/blog.service';
import CategoryClient from './CategoryClient';

// Cache control: Revalidate mỗi 60s
export const revalidate = 60;

// ĐỊNH NGHĨA LẠI TYPE CHO NEXT.JS 15 (Promise)
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// 1. Hàm tạo Metadata động
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const category = await blogService.getPublicCategoryBySlug(slug);
    
    if (!category) {
      return {
        title: 'Không tìm thấy danh mục - G-Mall Blog',
      };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: `${category.name} - Tạp Chí Đời Sống | G-Mall`,
      description: category.description || `Tổng hợp các bài viết về ${category.name}`,
      openGraph: {
        title: `${category.name} - Tạp Chí Đời Sống`,
        description: category.description,
        images: [...previousImages],
      },
    };
  } catch (error) {
    return {
      title: 'Danh mục Blog - G-Mall',
    };
  }
}

// 2. Main Page Component
export default async function CategoryPage({ params, searchParams }: PageProps) {
  // QUAN TRỌNG: Await cả params và searchParams
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  
  const page = Number(pageStr) || 1;
  const limit = 12;

  // Gọi Service (Hàm getPublicCategoryBySlug đã được fix ở bước trước để dùng Fallback)
  // Fetch song song để tối ưu tốc độ
  const [category, postsRes] = await Promise.all([
    blogService.getPublicCategoryBySlug(slug).catch(() => null),
    blogService.getPublicBlogs({ category: slug, page, limit, status: 'PUBLISHED' as any }).catch(() => null)
  ]);

  // Debug log phía server (hiện ở terminal) để double check
  console.log(`[SSR] Category Page: slug="${slug}" | Found: ${!!category}`);

  if (!category) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="container mx-auto py-20 text-center">Đang tải dữ liệu...</div>}>
      <CategoryClient 
        category={category} 
        initialPosts={postsRes?.data || []}
        pagination={postsRes?.meta}
      />
    </Suspense>
  );
}