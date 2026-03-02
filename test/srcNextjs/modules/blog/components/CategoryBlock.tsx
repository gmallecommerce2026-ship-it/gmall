// src/modules/blog/components/CategoryBlock.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPost, Category } from '@/types/blog';
import { BlogCard } from '@/components/blog/BlogCard';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CategoryLayoutType = 'layout-A' | 'layout-B' | 'layout-C' | 'layout-D' | 'layout-E' | 'layout-full';

interface CategoryBlockProps {
  category: Category;
  posts: BlogPost[];
  layout: CategoryLayoutType;
  color?: string;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({ category, posts, layout, color = 'bg-blue-600' }) => {
  if (!posts || posts.length === 0) return null;

  // Lấy class màu text tương ứng từ bg color (đơn giản hóa)
  // Lưu ý: Tailwind cần config safelist hoặc dùng style inline nếu dynamic class quá phức tạp
  const textColorClass = color.replace('bg-', 'text-');

  return (
    <section className="mb-10 w-full">
      {/* --- HEADER: Style tạp chí (Underline xuyên suốt) --- */}
      <div className="flex items-end justify-between border-b-2 border-gray-100 mb-5 pb-1">
        <div className="flex items-center gap-4 relative">
            {/* Thanh màu đậm chỉ nằm dưới title */}
            <div className={cn("absolute -bottom-[6px] left-0 h-[2px] w-full", color)}></div>
            
            {/* Title Danh mục cha */}
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 leading-none">
                <Link href={`/blog/category/${category.slug}`} className="hover:opacity-80 transition-opacity">
                    {category.name}
                </Link>
            </h2>

            {/* --- NÂNG CẤP: Hiển thị danh mục cấp 2 (Children) --- */}
            {category.children && category.children.length > 0 && (
                <div className="hidden md:flex items-center gap-3 ml-2">
                    {/* Dấu gạch đứng ngăn cách giữa title và sub-cats */}
                    <span className="text-gray-300 text-[10px] h-3 w-[1px] bg-gray-300"></span>

                    {category.children.slice(0, 5).map((child) => (
                        <Link 
                            key={child.id}
                            href={`/blog/category/${child.slug}`} // Link đến trang danh mục con
                            className="text-[11px] font-bold text-gray-400 uppercase tracking-wide hover:text-black transition-colors"
                        >
                            {child.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>

        {/* Nút xem thêm trỏ về danh mục cha */}
        <Link href={`/blog/category/${category.slug}`} className="flex items-center text-[11px] font-bold text-gray-400 hover:text-black uppercase transition mb-1 group">
          Xem thêm <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* --- BODY (Giữ nguyên logic cũ) --- */}
      <div className="w-full">
        {/* LAYOUT A: Standard Magazine (1 Big Left + List Right) */}
        {layout === 'layout-A' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 lg:col-span-8">
              <BlogCard post={posts[0]} variant="hero" className="h-[360px] rounded-[3px]" />
            </div>
            <div className="md:col-span-5 lg:col-span-4 flex flex-col divide-y divide-gray-100 bg-white border border-gray-100 px-4 rounded-[3px]">
              {posts.slice(1, 5).map(post => (
                <BlogCard key={post.id} post={post} variant="list" />
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT B: 2 Columns Split */}
        {layout === 'layout-B' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
             {[0, 3].map((startIndex) => {
                if (!posts[startIndex]) return null;
                return (
                    <div key={startIndex} className="flex flex-col gap-4">
                        <BlogCard post={posts[startIndex]} variant="simple" imageHeight="h-56" />
                        <div className="grid grid-cols-1 gap-0 border-t border-gray-100 pt-2">
                            {posts.slice(startIndex + 1, startIndex + 3).map(p => (
                                <BlogCard key={p.id} post={p} variant="list" className="py-2" />
                            ))}
                        </div>
                    </div>
                );
             })}
          </div>
        )}

        {/* LAYOUT C: Grid 4 Cards */}
        {layout === 'layout-C' && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {posts.slice(0, 4).map(post => (
                 <BlogCard key={post.id} post={post} variant="simple" imageHeight="h-44" className="bg-white" />
              ))}
           </div>
        )}

        {/* LAYOUT D: Overlay 3 Columns (Vertical) */}
        {layout === 'layout-D' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-1 h-[300px]">
              {posts.slice(0, 3).map((post) => (
                 <BlogCard 
                    key={post.id} 
                    post={post} 
                    variant="overlay" 
                    className="h-full rounded-[3px]" 
                 />
              ))}
           </div>
        )}
        
         {/* LAYOUT E */}
         {layout === 'layout-E' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 lg:col-span-4 flex flex-col divide-y divide-gray-100 bg-white border border-gray-100 px-4 order-2 md:order-1 rounded-[3px]">
              {posts.slice(1, 5).map(post => (
                <BlogCard key={post.id} post={post} variant="list" />
              ))}
            </div>
            <div className="md:col-span-7 lg:col-span-8 order-1 md:order-2">
              <BlogCard post={posts[0]} variant="hero" className="h-[360px] rounded-[3px]" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};