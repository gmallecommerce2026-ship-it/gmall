// src/modules/blog/components/HeroSection.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Hoặc icon từ thư viện bạn dùng
import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/components/blog/BlogCard';

interface HeroSectionProps {
  posts: BlogPost[]; // Cần ít nhất 5 bài để hiển thị đẹp
}

export const HeroSection: React.FC<HeroSectionProps> = ({ posts }) => {
  // Logic cho thanh Ticker (Xu hướng Hot)
  const [tickerIndex, setTickerIndex] = useState(0);
  const hotTopics = [
    "Outfit là gì? Tìm hiểu thuật ngữ hot trend 2026",
    "Sữa tươi bao nhiêu calo? Uống nhiều có béo không?",
    "Review sách 'Nhà Giả Kim': Hành trình tìm kho báu"
  ];

  const nextTicker = () => setTickerIndex((prev) => (prev + 1) % hotTopics.length);
  const prevTicker = () => setTickerIndex((prev) => (prev - 1 + hotTopics.length) % hotTopics.length);

  // Chia bài viết: 1 bài Big (Index 0), 4 bài Small (Index 1-4)
  const heroPost = posts[0];
  const subPosts = posts.slice(1, 5);

  if (!heroPost) return null;

  return (
    <section className="mb-8">
      {/* 1. Thanh Trending Bar (Ảnh 2 - Trên cùng) */}
      <div className="flex items-center border bg-white mb-4">
        <div className="bg-red-500 text-white text-xs font-bold px-4 py-2 uppercase whitespace-nowrap">
          Xu Hướng Hot
        </div>
        <div className="flex-1 px-4 overflow-hidden relative h-8 flex items-center">
          <p className="text-sm text-gray-700 truncate animate-fade-in">
             {hotTopics[tickerIndex]}
          </p>
        </div>
        <div className="flex border-l">
          <button onClick={prevTicker} className="p-2 hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextTicker} className="p-2 hover:bg-gray-100 text-gray-500 border-l">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Hero Grid Layout (Ảnh 2 - Dưới) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-1 h-auto lg:h-[450px]">
        
        {/* Cột Trái: Bài Big Feature (Chiếm 6/12 cột) */}
        <div className="lg:col-span-6 h-64 lg:h-full relative group overflow-hidden">
           {/* Tái sử dụng BlogCard với variant 'hero' nhưng override class để fill height */}
           <BlogCard 
             post={heroPost} 
             variant="hero" 
             className="h-full w-full rounded-none" 
           />
        </div>

        {/* Cột Phải: Grid 2x2 cho 4 bài nhỏ (Chiếm 6/12 cột) */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-1 h-full">
          {subPosts.map((post) => (
            <div key={post.id} className="relative h-48 lg:h-auto overflow-hidden group">
              {/* Sử dụng variant 'hero' nhưng kích thước nhỏ hơn, font chữ bé hơn */}
              <BlogCard 
                post={post} 
                variant="hero" 
                className="h-full w-full rounded-none text-sm" // Override text size
              />
              {/* Overlay Gradient nhẹ hơn cho bài nhỏ nếu cần */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};