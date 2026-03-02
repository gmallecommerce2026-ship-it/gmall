// src/app/(blog)/blog/[slug]/BlogDetailClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { blogService } from '@/services/blog.service';
import { BlogPost } from '@/types/blog';
import { BlogSidebar } from '@/modules/blog/components/BlogSidebar';
import { BlogCard } from '@/modules/blog/components/BlogCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

// --- Components Con: Widget Sản phẩm (Tách ra cho gọn) ---
const RelatedProductsWidget = ({ products }: { products: any[] }) => {
    if (!products || products.length === 0) return null;
    return (
        <div className="bg-white border border-blue-100 rounded-[3px] p-5 shadow-sm mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <h3 className="font-bold text-[13px] uppercase text-gray-900 tracking-wider mb-5 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Sản phẩm trong bài
            </h3>
            <div className="space-y-4">
                {products.map((item: any) => (
                <Link href={`/product-details/${item.id || '#'}`} key={item.id} className="flex gap-3 group cursor-pointer bg-gray-50 p-2 rounded-[3px] hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                    <div className="w-14 h-14 relative rounded-[2px] overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                        <Image 
                            src={item.images ? item.images[0].url : item.img || "/placeholder.jpg"} 
                            alt={item.name} 
                            fill 
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition">{item.name}</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-red-600 font-bold text-xs">
                            {typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + 'đ' : item.price}
                            </span>
                            <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded-[2px] group-hover:border-blue-200 group-hover:text-blue-600">Mua ngay</span>
                        </div>
                    </div>
                </Link>
                ))}
            </div>
        </div>
    );
};

// --- MOCK DATA ---
const RELATED_PRODUCTS_FALLBACK = [
     { id: 1, name: "Set Cà phê Arabica Cầu Đất Thượng Hạng", price: 250000, img: "https://picsum.photos/seed/coffee/100/100" },
     { id: 2, name: "Áo dài cách tân Lụa tơ tằm Premium", price: 890000, img: "https://picsum.photos/seed/aodai/100/100" },
     { id: 3, name: "Túi xách Canvas thời trang Vintage", price: 150000, img: "https://picsum.photos/seed/bag/100/100" }
];

export default function BlogDetailClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) { setLoading(false); return; }
      setLoading(true);
      try {
        const res: any = await blogService.getPublicBlogDetail(slug);
        const realPost = res?.data || res;
        if (realPost) setPost(realPost);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  const getCategoryName = (cat: any) => (typeof cat === 'string' ? cat : cat?.name || "Tin tức");
  const getCategorySlug = (cat: any) => (typeof cat === 'string' ? '' : cat?.slug || "");

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
       </div>
    </div>
  );
  
  if (!post) return <div className="min-h-screen grid place-items-center">Bài viết không tồn tại.</div>;

  const displayProducts = post.relatedProducts?.length ? post.relatedProducts : RELATED_PRODUCTS_FALLBACK;

  // Breadcrumbs Config
  const breadcrumbs = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: getCategoryName(post.category), href: `/blog/category/${getCategorySlug(post.category)}` },
    { name: post.title, href: '#' }, // Current items thường không cần link
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-20">
      
      {/* Scroll Progress Bar */}
      <div className="h-1 w-full bg-gray-100 fixed top-0 z-50 left-0 right-0">
          <div className="h-full bg-blue-600 w-full origin-left scale-x-0 animate-scroll-progress"></div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        
        {/* Breadcrumb chuẩn */}
        <div className="mb-8">
            <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- MAIN ARTICLE (8 Columns) --- */}
          <article className="lg:col-span-8">
            
            {/* Header Bài viết */}
            <header className="mb-8">
               <div className="flex gap-2 mb-4">
                 <Link href={`/blog/category/${getCategorySlug(post.category)}`} className="inline-block bg-blue-600 text-white px-3 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider hover:bg-blue-700 transition">
                   {getCategoryName(post.category)}
                 </Link>
                 <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider">
                    5 phút đọc
                 </span>
               </div>
               
               <h1 className="text-3xl md:text-5xl font-black leading-tight text-gray-900 mb-6 tracking-tight">
                 {post.title}
               </h1>

               {/* Meta info row */}
               <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200 border border-white shadow-sm">
                        <Image src={post.author?.avatar || "/default-avatar.svg"} fill alt="Author" className="object-cover" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">{post.author?.name || 'G-Mall Editor'}</p>
                        <p className="text-[11px] text-gray-500">{post.createdAt ? format(new Date(post.createdAt), "dd MMM, yyyy", { locale: vi }) : "Vừa xong"}</p>
                     </div>
                  </div>
                  
                  {/* Share buttons (Giả lập) */}
                  <div className="flex gap-2">
                     <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                     </button>
                     <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                     </button>
                  </div>
               </div>
            </header>

            {/* Featured Image - 3px rounded */}
            {post.thumbnail && (
              <figure className="mb-10 rounded-[3px] overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                 <div className="relative aspect-video w-full">
                    <Image 
                      src={post.thumbnail} 
                      alt={post.title} 
                      fill 
                      className="object-cover"
                      priority
                    />
                 </div>
                 <figcaption className="text-center text-xs text-gray-400 mt-2 italic">Hình ảnh minh họa cho bài viết</figcaption>
              </figure>
            )}

            {/* Content Body */}
            <div 
              className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
              prose-p:text-gray-700 prose-p:leading-8
              prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:text-blue-800
              prose-img:rounded-[3px] prose-img:shadow-sm prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:font-medium prose-blockquote:not-italic"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {/* Footer bài viết: Tags */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                 <div className="flex flex-wrap gap-2">
                     {post.keywords.map((tag, idx) => (
                        <Link href={`/blog?search=${tag}`} key={idx} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-[2px] text-xs font-medium hover:bg-black hover:text-white transition cursor-pointer">
                           #{tag}
                        </Link>
                     ))}
                 </div>
              </div>
            )}

            {/* Author Box - Minimalist */}
            <div className="mt-10 bg-gray-50 rounded-[3px] p-6 flex items-center gap-5 border border-gray-100">
                <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                   <Image src={post.author?.avatar || "/default-avatar.svg"} fill alt="Author" className="object-cover" />
                </div>
                <div>
                   <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Được viết bởi</p>
                   <h3 className="font-bold text-lg text-gray-900">{post.author?.name || "Biên tập viên"}</h3>
                   <p className="text-gray-600 text-sm mt-1">Chia sẻ kiến thức mua sắm và phong cách sống.</p>
                </div>
            </div>

            {/* Bài liên quan (Grid 2 cột) */}
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-1.5 h-8 bg-black mr-3"></span>
                    Có thể bạn quan tâm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        // Mockup bài liên quan, thực tế lấy từ API
                        <BlogCard 
                            key={i}
                            variant="simple"
                            imageHeight="h-48"
                            post={{
                                ...post, 
                                id: String(i), 
                                title: i === 1 ? "Top xu hướng thời trang 2026 bạn cần biết" : "Bí quyết săn sale hiệu quả",
                                thumbnail: `https://picsum.photos/seed/${i+50}/400/300`
                            }} 
                        />
                    ))}
                </div>
            </div>

          </article>

          {/* --- SIDEBAR (4 Columns) - Sticky --- */}
          <aside className="lg:col-span-4 space-y-8">
             <div className="sticky top-24 pl-4 border-l border-gray-100">
                
                {/* SỬ DỤNG LẠI BLOG SIDEBAR VỚI SLOT EXTRA CONTENT */}
                <BlogSidebar 
                    extraContent={<RelatedProductsWidget products={displayProducts} />}
                />

             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}