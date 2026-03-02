// src/app/(blog)/layout.tsx
import React from 'react';
import localFont from "next/font/local";
import { blogService } from '@/services/blog.service';
import BlogLayoutHeader from './components/BlogLayoutHeader'; // Import wrapper vừa tạo
import { BlogFooter } from '@/modules/blog/components/BlogFooter'; // Import Footer gốc

// Font configuration (Giữ nguyên của bạn)
const blogFont = localFont({
  src: [
    {
      path: "../../fonts/svn.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-blog-custom",
  display: "swap",
});

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch Categories từ Server (Tốt cho SEO Internal Links)
  let categories: any = [];
  try {
    categories = await blogService.getCategories();
  } catch (error) {
    console.error("Failed to fetch blog categories in layout", error);
  }

  return (
    <div className={`${blogFont.variable} ${blogFont.className} font-blog antialiased min-h-screen flex flex-col bg-white`}>
       {/* 2. Header nằm ở Layout, hiển thị mọi page */}
       <BlogLayoutHeader categories={categories} />

       {/* 3. Main Content (Sẽ dãn ra để đẩy footer xuống đáy nếu nội dung ngắn) */}
       <main className="flex-grow">
          {children}
       </main>

       {/* 4. Footer nằm ở Layout */}
       <BlogFooter />
    </div>
  );
}