// src/app/(blog)/blog/category/[slug]/CategoryClient.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BlogCategory } from '@/services/blog.service';
import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/modules/blog/components/BlogCard';
import { BlogSidebar } from '@/modules/blog/components/BlogSidebar';
import Breadcrumbs from '@/components/ui/Breadcrumbs'; // Giữ component breadcrumb gốc của bạn

interface CategoryClientProps {
  category: BlogCategory;
  initialPosts: BlogPost[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CategoryClient: React.FC<CategoryClientProps> = ({ category, initialPosts, pagination }) => {
  
  const breadcrumbs = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: category.name, href: `/blog/category/${category.slug}` },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-gray-900">
      <div className="container mx-auto px-4 mt-6">
        
        {/* 1. Header Section - Clean & Minimalist */}
        <div className="mb-10 pb-6 border-b border-gray-100">
           <div className="mb-4">
              <Breadcrumbs items={breadcrumbs} /> 
           </div>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2 block">Chuyên mục</span>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                  {category.name}
                </h1>
              </div>
              {category.description && (
                <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed text-right md:text-left">
                  {category.description}
                </p>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 2. Main Content (8 cols) */}
          <div className="lg:col-span-8">
            
            {initialPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                {initialPosts.map((post, index) => (
                  <div key={post.id} className="h-full">
                    {/* Bài đầu tiên hiển thị ảnh to hơn (nếu muốn), ở đây giữ simple để đều lưới */}
                    <BlogCard 
                      post={post} 
                      variant="simple" 
                      imageHeight="h-52 md:h-60" // Ảnh cao ráo hơn
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-[3px] border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Chưa có bài viết nào trong danh mục này.</p>
                <Link href="/blog" className="text-blue-600 font-bold hover:underline mt-2 inline-block text-sm">
                  ← Quay lại trang chủ Blog
                </Link>
              </div>
            )}

            {/* Pagination Styled */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-16 flex justify-center border-t border-gray-100 pt-8">
                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/blog/category/${category.slug}?page=${pageNum}`}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-[3px] text-sm font-bold transition-all border
                        ${pagination.page === pageNum 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'}
                      `}
                    >
                      {pageNum}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Sidebar (4 cols) - Sticky */}
          <aside className="hidden lg:block lg:col-span-4 h-fit sticky top-24 pl-4 border-l border-gray-100">
             <BlogSidebar />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default CategoryClient;