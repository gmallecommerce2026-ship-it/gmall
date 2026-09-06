// src/modules/blog/components/BlogSidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { blogService, BlogCategory } from '@/services/blog.service';
import { BlogPost } from '@/types/blog';

interface BlogSidebarProps {
  className?: string;
  extraContent?: React.ReactNode; // Slot để chèn nội dung tùy chỉnh (VD: Related Products)
}

const WidgetHeader = ({ title }: { title: string }) => (
  <div className="mb-5 flex items-center">
    <span className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></span>
    <h3 className="font-bold text-[13px] uppercase text-gray-900 tracking-wider">{title}</h3>
  </div>
);

const fmtDate = (d?: string) => {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
  } catch {
    return '';
  }
};

export const BlogSidebar: React.FC<BlogSidebarProps> = ({ className, extraContent }) => {
  // [FIX wiki 0092] Thay data GIẢ (4 bài picsum link #, tags cứng, follow-count bịa) bằng data THẬT.
  const [latest, setLatest] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await blogService.getPublicBlogs({ page: 1, limit: 5 });
        // [FIX wiki 0095/0099/0103] `blogService` chạy trên `apiClient` (fetch): `request()`
        // trả `null` khi 401-redirect / body không phải JSON, nên `res.data` ném TypeError
        // (cast `as Promise<PaginatedResponse>` trong service che mất `| null`, TS không cảnh báo).
        // Chuẩn hoá về mảng vì `latest` được render bằng `.map`.
        const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        setLatest(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Sidebar latest posts error', e);
      }
      try {
        const cats = await blogService.getCategories();
        setCategories((cats || []).slice(0, 10));
      } catch (e) {
        console.error('Sidebar categories error', e);
      }
    })();
  }, []);

  return (
    <div className={cn('flex flex-col gap-10 w-full', className)}>
      {/* 1. SLOT CHO NỘI DUNG TÙY CHỈNH (Ưu tiên hiển thị đầu tiên nếu có) */}
      {extraContent && <div className="animate-fade-in">{extraContent}</div>}

      {/* 2. Search Widget — submit về /blog?search= */}
      <form
        action="/blog"
        method="GET"
        className="relative group"
      >
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm bài viết..."
          className="w-full pl-4 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-[3px] focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
        <button type="submit" aria-label="Tìm kiếm" className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* 3. Social (links — KHÔNG còn số follow bịa) */}
      <div className="border border-gray-100 rounded-[3px] overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-black uppercase text-gray-600 tracking-wide">Follow Us</span>
        </div>
        <div className="flex flex-col bg-white">
          <SocialRow icon={<Facebook size={16} />} label="Facebook" color="text-blue-600" href="https://facebook.com" />
          <SocialRow icon={<Instagram size={16} />} label="Instagram" color="text-pink-600" href="https://instagram.com" />
          <SocialRow icon={<Youtube size={16} />} label="Youtube" color="text-red-600" href="https://youtube.com" />
        </div>
      </div>

      {/* 4. Chủ đề — DANH MỤC THẬT (thay trending tags cứng) */}
      {categories.length > 0 && (
        <div>
          <WidgetHeader title="Chủ đề" />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className="px-3 py-1.5 bg-white border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all rounded-[2px] uppercase"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Bài viết mới — BÀI THẬT (thay 4 bài picsum giả) */}
      {latest.length > 0 && (
        <div>
          <WidgetHeader title="Bài viết mới" />
          <div className="flex flex-col gap-5">
            {latest.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="flex gap-4 group cursor-pointer">
                <div className="relative w-[80px] h-[60px] shrink-0 rounded-[3px] overflow-hidden bg-gray-200">
                  {post.thumbnail ? (
                    <Image src={post.thumbnail} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No image</div>
                  )}
                </div>
                <div className="flex flex-col justify-between py-0.5">
                  <h4 className="text-[13px] font-bold leading-snug text-gray-800 group-hover:text-blue-600 line-clamp-2 transition-colors">
                    {post.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">{fmtDate(post.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SocialRow = ({ icon, label, color, href }: { icon: React.ReactNode; label: string; color: string; href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer group"
  >
    <div className="flex items-center gap-3">
      <div className={`${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <span className="text-[11px] font-bold text-gray-600 uppercase group-hover:text-blue-700">{label}</span>
    </div>
  </a>
);
