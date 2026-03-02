// src/modules/blog/components/BlogSidebar.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Search } from 'lucide-react';
import { cn } from '@/lib/utils'; // Giả sử bạn có cn utility

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

export const BlogSidebar: React.FC<BlogSidebarProps> = ({ className, extraContent }) => {
  return (
    <div className={cn("flex flex-col gap-10 w-full", className)}>
      
      {/* 1. SLOT CHO NỘI DUNG TÙY CHỈNH (Ưu tiên hiển thị đầu tiên nếu có) */}
      {extraContent && (
        <div className="animate-fade-in">
           {extraContent}
        </div>
      )}

      {/* 2. Search Widget */}
      <div>
         <div className="relative group">
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..." 
              className="w-full pl-4 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-[3px] focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
            />
            <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4 group-hover:text-blue-500 transition-colors" />
         </div>
      </div>

      {/* 3. Social Stats */}
      <div className="border border-gray-100 rounded-[3px] overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
           <span className="text-xs font-black uppercase text-gray-600 tracking-wide">Follow Us</span>
        </div>
        <div className="flex flex-col bg-white">
          <SocialRow icon={<Facebook size={16} />} label="Facebook" count="3.2M" color="text-blue-600" />
          <SocialRow icon={<Instagram size={16} />} label="Instagram" count="153k" color="text-pink-600" />
          <SocialRow icon={<Youtube size={16} />} label="Youtube" count="387k" color="text-red-600" />
        </div>
      </div>

      {/* 4. Trending Tags */}
      <div>
        <WidgetHeader title="Trending Topics" />
        <div className="flex flex-wrap gap-2">
          {["Review", "iPhone 16", "Sách hay", "Mẹo vặt", "Du lịch", "Podcasting", "Setup"].map((tag, idx) => (
            <Link key={idx} href={`/blog?search=${tag}`} className="px-3 py-1.5 bg-white border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all rounded-[2px] uppercase">
                #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Banner Ads */}
      <div className="w-full aspect-[3/4] bg-gray-100 relative rounded-[3px] overflow-hidden border border-gray-100 group cursor-pointer">
         <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <span className="font-black text-lg tracking-widest opacity-30">ADVERTISEMENT</span>
         </div>
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      {/* 6. Latest / Popular Posts */}
      <div>
         <WidgetHeader title="Bài viết mới" />
         <div className="flex flex-col gap-5">
             {[1,2,3,4].map((i) => (
                 <Link href="#" key={i} className="flex gap-4 group cursor-pointer">
                    <div className="relative w-[80px] h-[60px] shrink-0 rounded-[3px] overflow-hidden bg-gray-200">
                        {/* Thay bằng component Image thật */}
                        <Image src={`https://picsum.photos/seed/${i + 10}/200/200`} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                        <h4 className="text-[13px] font-bold leading-snug text-gray-800 group-hover:text-blue-600 line-clamp-2 transition-colors">
                            Kinh nghiệm setup góc làm việc tối giản cho Developer
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">12 Tháng 5, 2026</span>
                    </div>
                 </Link>
             ))}
         </div>
      </div>

    </div>
  );
};

const SocialRow = ({ icon, label, count, color }: { icon: React.ReactNode, label: string, count: string, color: string }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3">
       <div className={`${color} group-hover:scale-110 transition-transform`}>{icon}</div>
       <span className="text-[11px] font-bold text-gray-600 uppercase group-hover:text-blue-700">{label}</span>
    </div>
    <span className="text-[11px] font-bold text-gray-400 group-hover:text-blue-700">{count}</span>
  </div>
);
