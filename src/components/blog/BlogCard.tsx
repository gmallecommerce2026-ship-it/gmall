// src/components/blog/BlogCard.tsx
// TS-fix wiki 0031: BlogCard - null-safe thumbnail/author/category + excerpt fallback
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { cn } from '@/lib/utils'; // Giả định bạn có clsx/tailwind-merge

const PLACEHOLDER_IMG = '/assets/placeholder.png';

// Helper: lấy tên category an toàn (BE có thể trả string slug hoặc object)
const getCategoryName = (cat: BlogPost['category']): string => {
  if (!cat) return '';
  if (typeof cat === 'string') return cat;
  return cat.name || '';
};

interface BlogCardProps {
  post: BlogPost;
  variant?: 'hero' | 'featured' | 'list' | 'sidebar' | 'simple';
  className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'list', className }) => {
  // Format ngày tháng
  const dateStr = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const thumb = post.thumbnail || PLACEHOLDER_IMG;
  const categoryName = getCategoryName(post.category);
  const excerpt = post.excerpt || post.description || '';

  // UI cho variant "HERO" (Ảnh to, text đè)
  if (variant === 'hero') {
    return (
      <Link href={`/blog/${post.slug}`} className={cn("group relative block h-full overflow-hidden rounded-lg", className)}>
        <Image src={thumb} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 p-4 text-white">
          {categoryName && (
            <span className="mb-2 inline-block rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase">
              {categoryName}
            </span>
          )}
          <h3 className="text-xl font-bold leading-tight group-hover:text-blue-400">{post.title}</h3>
          <p className="mt-1 text-sm opacity-90">{dateStr}</p>
        </div>
      </Link>
    );
  }

  // UI cho variant "LIST" (Ảnh trái, Text phải - Ảnh 3, 4)
  if (variant === 'list') {
    return (
      <div className={cn("flex gap-4 py-3", className)}>
        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded">
           <Image src={thumb} alt={post.title} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <Link href={`/blog/${post.slug}`}>
            <h4 className="line-clamp-2 font-medium hover:text-blue-600">{post.title}</h4>
          </Link>
          <span className="mt-1 text-xs text-gray-500">{dateStr}</span>
        </div>
      </div>
    );
  }

  // Default: Card chuẩn (Ảnh trên, Text dưới)
  return (
    <div className={cn("group flex flex-col", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image src={thumb} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" />
      </div>
      <div className="mt-3">
        <Link href={`/blog/${post.slug}`}>
           <h3 className="line-clamp-2 text-lg font-bold leading-snug group-hover:text-blue-600">
             {post.title}
           </h3>
        </Link>
        <div className="mt-2 flex items-center text-xs text-gray-500">
           <span className="font-semibold text-gray-700">{post.author?.name || 'Ẩn danh'}</span>
           <span className="mx-2">•</span>
           <span>{dateStr}</span>
        </div>
        {excerpt && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{excerpt}</p>}
      </div>
    </div>
  );
};
