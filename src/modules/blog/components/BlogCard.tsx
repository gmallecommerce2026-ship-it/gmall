// src/modules/blog/components/BlogCard.tsx
// TS-fix wiki 0031: BlogCard - null-safe thumbnail/category/excerpt; align variant với CategoryBlock
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

const PLACEHOLDER_IMG = '/assets/placeholder.png';

const getCategoryName = (cat: BlogPost['category']): string => {
  if (!cat) return '';
  if (typeof cat === 'string') return cat;
  return cat.name || '';
};

interface BlogCardProps {
  post: BlogPost;
  variant?: 'hero' | 'featured' | 'list' | 'sidebar' | 'simple' | 'overlay';
  className?: string;
  imageHeight?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  variant = 'simple',
  className,
  imageHeight = 'h-48'
}) => {
  // Fix BUG-FE-A (wiki 0031): guard isValid trước khi format. date-fns `format()`
  // throws RangeError "Invalid time value" nếu input không parse được Date —
  // crash render. Test C38 bắt được. Trả '' nếu invalid → render bỏ qua phần date.
  const dateObj = post.createdAt ? new Date(post.createdAt) : null;
  const dateStr = dateObj && isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy', { locale: vi }) : '';
  const thumb = post.thumbnail || PLACEHOLDER_IMG;
  const categoryName = getCategoryName(post.category);
  const excerpt = post.excerpt || post.description || '';

  // Common styles for consistency
  const cardRounded = "rounded-[3px]"; // 3-4px radius as requested
  const hoverEffect = "group-hover:text-blue-700 transition-colors duration-200";

  // 1. Variant OVERLAY
  if (variant === 'overlay') {
    return (
      <Link href={`/blog/${post.slug}`} className={cn("group relative block overflow-hidden w-full h-full", cardRounded, className)}>
        <Image src={thumb} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
           {categoryName && (
             <span className="inline-block px-1.5 py-0.5 mb-2 text-[10px] font-bold uppercase bg-blue-600 text-white leading-none rounded-[2px]">
               {categoryName}
             </span>
           )}
           <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
             {post.title}
           </h3>
           <p className="mt-1 text-[11px] opacity-80 font-medium tracking-wide text-gray-300">{dateStr}</p>
        </div>
      </Link>
    );
  }

  // 2. Variant HERO (Vuông vức, khít)
  if (variant === 'hero') {
    return (
      <Link href={`/blog/${post.slug}`} className={cn("group relative block h-full overflow-hidden w-full", className)}>
        <Image src={thumb} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white w-full">
          {categoryName && (
            <span className="mb-2 inline-block bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
              {categoryName}
            </span>
          )}
          <h3 className="text-lg md:text-2xl font-bold leading-tight mb-2 group-hover:text-gray-200 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center text-xs opacity-90 gap-2 font-medium text-gray-300">
             <span>{post.author?.name || 'Ẩn danh'}</span>
             <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
             <span>{dateStr}</span>
          </div>
        </div>
      </Link>
    );
  }

  // 3. Variant LIST (Ảnh trái, Text phải - Border dưới mỏng)
  if (variant === 'list') {
    return (
      <div className={cn("flex gap-3 py-3 border-b border-gray-100 last:border-0 group h-full", className)}>
        <div className={cn("relative w-28 shrink-0 overflow-hidden", cardRounded)}>
           <Image src={thumb} alt={post.title} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-start py-0.5">
          <Link href={`/blog/${post.slug}`}>
            <h4 className={cn("line-clamp-2 text-sm font-bold text-gray-800 leading-snug", hoverEffect)}>
              {post.title}
            </h4>
          </Link>
          <span className="mt-auto pt-1 text-[11px] text-gray-400 font-medium">{dateStr}</span>
        </div>
      </div>
    );
  }

  // 4. Variant SIMPLE (Classic Magazine Card)
  return (
    <div className={cn("group flex flex-col h-full bg-white", className)}>
      <div className={cn("relative w-full overflow-hidden mb-2.5", imageHeight, cardRounded)}>
        <Image src={thumb} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        {/* Category tag floating on image top-left */}
        {categoryName && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide rounded-[2px] backdrop-blur-sm">
              {categoryName}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <Link href={`/blog/${post.slug}`}>
           <h3 className={cn("line-clamp-2 text-[15px] font-bold leading-snug text-gray-900", hoverEffect)}>
             {post.title}
           </h3>
        </Link>
        <div className="mt-2 flex items-center text-[11px] text-gray-500 gap-2 font-medium">
           <span className="uppercase tracking-wide">{post.author?.name || 'Ẩn danh'}</span>
           <span className="text-gray-300">|</span>
           <span>{dateStr}</span>
        </div>
        {excerpt && (
           <p className="mt-2 line-clamp-2 text-xs text-gray-500 font-normal leading-relaxed">{excerpt}</p>
        )}
      </div>
    </div>
  );
};
