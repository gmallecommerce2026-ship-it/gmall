// src/app/(blog)/blog/[slug]/page.tsx
import React, { Suspense } from 'react';
import BlogDetailClient from './BlogDetailClient';
import { Metadata, ResolvingMetadata } from 'next';
import { blogService } from '@/services/blog.service';
import { notFound } from 'next/navigation'; // Import để xử lý 404 chuẩn

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

// 1. Tạo Metadata chuẩn SEO + Keywords + Canonical
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  try {
    const blog = await blogService.getPublicBlogDetail(slug);
    
    // Lấy ảnh thumbnail hoặc fallback
    const images = blog.thumbnail ? [blog.thumbnail] : [];

    return {
      title: blog.metaTitle || `${blog.title} | Tạp Chí Đời Sống`,
      description: blog.metaDescription || blog.title, // Fallback description nếu thiếu
      keywords: blog.keywords || [], // MAP KEYWORDS TỪ BACKEND
      alternates: {
        canonical: `/blog/${slug}`, // Canonical URL cực quan trọng
      },
      openGraph: {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription,
        url: `/blog/${slug}`,
        siteName: 'Tên Sàn Thương Mại',
        images: images,
        type: 'article', // Khai báo rõ là bài viết
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.author?.name || 'Admin'],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.metaDescription,
        images: images,
      },
    };
  } catch (error) {
    return {
      title: 'Không tìm thấy bài viết',
    };
  }
}

// 2. Page Component chính
export default async function BlogDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  // Gọi lại API ở đây để tạo JSON-LD (Next.js sẽ dedupe request này nên không lo gọi 2 lần)
  let blogData = null;
  try {
     blogData = await blogService.getPublicBlogDetail(decodedSlug);
  } catch (e) {
     notFound(); // Chuyển hướng 404 nếu không thấy bài
  }

  // 3. Cấu hình JSON-LD (Schema.org) cho Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogData.title,
    description: blogData.metaDescription,
    image: blogData.thumbnail ? [blogData.thumbnail] : [],
    datePublished: blogData.createdAt,
    dateModified: blogData.updatedAt,
    author: {
      '@type': 'Person',
      name: blogData.author?.name || 'Tạp Chí Đời Sống',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tên Sàn Thương Mại', // Tên brand của bạn
      logo: {
        '@type': 'ImageObject',
        url: 'https://domain.com/logo.png', // Thay bằng link logo thật của bạn
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://domain.com/blog/${decodedSlug}`,
    },
  };

  return (
    <>
      {/* Inject JSON-LD vào thẻ script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Suspense 
        fallback={
          <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center font-serif italic text-gray-500">
            Đang tải bài viết...
          </div>
        }
      >
        <BlogDetailClient slug={decodedSlug} />
      </Suspense>
    </>
  );
}