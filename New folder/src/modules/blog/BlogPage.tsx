// src/modules/blog/BlogPage.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button'; // Import Button hiện có của bạn
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  ChevronRightIcon, 
  FireIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'; // Giả sử bạn dùng Heroicons hoặc icon tương tự

// --- MOCK DATA (Dữ liệu giả lập) ---
const CATEGORIES = ["Tất cả", "Công nghệ", "Design", "Marketing", "Tutorials", "Business", "Life style"];

const FEATURED_POST = {
  id: 1,
  title: "Tương lai của Thương mại điện tử: Xu hướng AI năm 2025",
  excerpt: "Khám phá cách Trí tuệ nhân tạo đang thay đổi cách chúng ta mua sắm trực tuyến, từ cá nhân hóa trải nghiệm đến tự động hóa logistics.",
  image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2070",
  author: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=1" },
  date: "26 Tháng 12, 2024",
  readTime: "5 phút đọc",
  category: "Công nghệ"
};

const POSTS = [
  {
    id: 2,
    title: "Hướng dẫn tối ưu SEO cho người mới bắt đầu",
    excerpt: "Những bước cơ bản nhưng quan trọng để đưa website của bạn lên top Google.",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800",
    author: { name: "Trần B", avatar: "https://i.pravatar.cc/150?u=2" },
    date: "25 Tháng 12, 2024",
    readTime: "8 phút đọc",
    category: "Marketing"
  },
  {
    id: 3,
    title: "UI/UX Design: Những quy luật bất biến",
    excerpt: "Tại sao thiết kế đơn giản lại luôn chiến thắng trong mắt người dùng?",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=800",
    author: { name: "Lê C", avatar: "https://i.pravatar.cc/150?u=3" },
    date: "24 Tháng 12, 2024",
    readTime: "6 phút đọc",
    category: "Design"
  },
  {
    id: 4,
    title: "Cách xây dựng đội ngũ làm việc từ xa hiệu quả",
    excerpt: "Kinh nghiệm quản lý nhân sự trong kỷ nguyên số hóa toàn cầu.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    author: { name: "Phạm D", avatar: "https://i.pravatar.cc/150?u=4" },
    date: "22 Tháng 12, 2024",
    readTime: "10 phút đọc",
    category: "Business"
  },
   {
    id: 5,
    title: "Minimalism: Sống tối giản để hạnh phúc hơn",
    excerpt: "Áp dụng phong cách sống tối giản vào công việc và đời sống hàng ngày.",
    image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=800",
    author: { name: "Hoàng E", avatar: "https://i.pravatar.cc/150?u=5" },
    date: "20 Tháng 12, 2024",
    readTime: "4 phút đọc",
    category: "Life style"
  },
];

// --- SUB-COMPONENTS ---

// 1. Category Filter Chip (Customized based on your src/components/ui/FilterChip.tsx)
const CategoryChip = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
      ${active 
        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
        : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-500 hover:text-brand-500'}
    `}
  >
    {label}
  </button>
);

// 2. Blog Card Item
const BlogCard = ({ post }: { post: typeof POSTS[0] }) => (
  <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-theme-lg transition-all duration-300">
    {/* Image Container */}
    <div className="relative h-56 overflow-hidden">
      <Image 
        src={post.image} 
        alt={post.title} 
        fill 
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-4 left-4">
        <span className="bg-white/90 backdrop-blur-md text-brand-600 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
          {post.category}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col flex-1 p-6">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 font-medium">
        <span>{post.date}</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>{post.readTime}</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors">
        <Link href={`/blog/${post.id}`}>{post.title}</Link>
      </h3>
      
      <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
        {post.excerpt}
      </p>

      {/* Author Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
          </div>
          <span className="text-sm font-medium text-gray-700">{post.author.name}</span>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  return (
    <div className="min-h-screen bg-gray-50 font-outfit pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm mb-2 block">
              Our Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Kiến thức & Xu hướng mới nhất
            </h1>
            <p className="text-lg text-gray-500">
              Cập nhật thông tin, mẹo vặt và những bài viết chuyên sâu về công nghệ và đời sống.
            </p>
          </div>

          {/* Featured Post Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-60">
               <Image 
                src={FEATURED_POST.image} 
                alt="Featured" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
            
            <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-end h-[500px] md:h-[600px] max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-md uppercase">
                  {FEATURED_POST.category}
                </span>
                <span className="flex items-center gap-1 text-gray-300 text-sm font-medium">
                  <FireIcon className="w-4 h-4 text-orange-500" />
                  Bài viết nổi bật
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight hover:text-brand-200 transition-colors cursor-pointer">
                {FEATURED_POST.title}
              </h2>
              <p className="text-gray-300 text-lg md:text-xl mb-8 line-clamp-2 max-w-2xl">
                {FEATURED_POST.excerpt}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative border-2 border-white/20">
                     <Image src={FEATURED_POST.author.avatar} alt="Author" fill />
                  </div>
                  <div>
                    <p className="font-semibold">{FEATURED_POST.author.name}</p>
                    <p className="text-xs text-gray-400">{FEATURED_POST.date}</p>
                  </div>
                </div>
                <Button variant="primary" className="hidden sm:flex">
                  Đọc ngay <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <CategoryChip 
                    key={cat} 
                    label={cat} 
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>
              
              <div className="relative min-w-[240px]">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bài viết..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {POSTS.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center">
              <Button variant="outline" className="px-8 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-brand-500 hover:border-brand-500">
                Xem thêm bài viết
              </Button>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <aside className="w-full lg:w-[350px] space-y-10">
            
            {/* Newsletter Widget */}
            <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100 text-center relative overflow-hidden">
               {/* Decorative circles matching brand colors */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-brand-500">
                  <EnvelopeIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng ký bản tin</h3>
                <p className="text-gray-600 text-sm mb-6">Nhận những bài viết mới nhất và ưu đãi độc quyền gửi thẳng vào hộp thư của bạn.</p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  />
                  <Button className="w-full justify-center shadow-none">Đăng ký ngay</Button>
                </div>
              </div>
            </div>

            {/* Trending Posts Widget */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                Xu hướng tuần này
              </h3>
              <div className="space-y-6">
                {POSTS.slice(0, 3).map((post, idx) => (
                  <div key={idx} className="flex items-start gap-4 group cursor-pointer">
                    <span className="text-3xl font-bold text-gray-200 group-hover:text-brand-500 transition-colors font-outfit">0{idx + 1}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Cloud */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                Tags phổ biến
              </h3>
              <div className="flex flex-wrap gap-2">
                {['eCommerce', 'Startup', 'Technology', 'Web Design', 'ReactJS', 'Growth Hacking'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-brand-50 hover:text-brand-600 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;