'use client';
import React from 'react';
import { Calendar, Clock, Download, ExternalLink, Link2, ChevronRight, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
         <Link href="/campaigns" className="hover:text-gray-800">Chiến dịch</Link>
         <ChevronRight size={14}/>
         <span className="font-medium text-gray-800">Siêu sale Valentine 2026</span>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-8">
         <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-gray-200 rounded-xl overflow-hidden shrink-0">
            {/* Image Placeholder */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">Campaign Banner</div>
         </div>
         
         <div className="flex-1 space-y-6">
            <div>
               <h1 className="text-3xl font-bold text-gray-800 mb-3">Siêu sale Valentine - Trao gửi yêu thương ❤️</h1>
               <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                     <Calendar size={16} className="text-gray-500"/> 01/02 - 14/02/2026
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full font-medium">
                     🔥 Hoa hồng lên đến 15%
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
               <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Cơ chế hoa hồng</p>
                  <p className="font-medium text-gray-800">10% (Cố định) + 5% (Thưởng)</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Cookie lưu trữ</p>
                  <p className="font-medium text-gray-800">30 ngày</p>
               </div>
            </div>

            <div className="flex gap-3">
               <Button className="flex-1 gap-2">
                  <Link2 size={18}/> Tạo Link Ngay
               </Button>
               <Button variant="outline" className="gap-2">
                  <Download size={18}/> Tải Banner
               </Button>
            </div>
         </div>
      </div>

      {/* Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left: Description */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiết chương trình</h3>
               <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
                  <p>Chào các bạn Affiliate,</p>
                  <p>Mùa Valentine năm nay, chúng tôi tung ra bộ sưu tập quà tặng giới hạn với mức giá cực kỳ ưu đãi. Đây là cơ hội tuyệt vời để các bạn đẩy số với mức hoa hồng hấp dẫn chưa từng có.</p>
                  <ul className="list-disc pl-5 space-y-1">
                     <li>Áp dụng cho toàn bộ sản phẩm thuộc danh mục Quà tặng.</li>
                     <li>Miễn phí vận chuyển cho đơn từ 299k.</li>
                     <li>Tặng kèm thiệp viết tay cho mọi đơn hàng.</li>
                  </ul>
                  <p className="font-bold text-gray-800">Điều kiện ghi nhận:</p>
                  <ul className="list-disc pl-5 space-y-1">
                     <li>Ghi nhận Last Click.</li>
                     <li>Không chấp nhận traffic từ Brand Key (Chạy quảng cáo từ khóa thương hiệu).</li>
                  </ul>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm nổi bật (Top Converting)</h3>
               <div className="space-y-4">
                  {[1,2,3].map(i => (
                     <div key={i} className="flex gap-4 items-center p-3 border border-gray-100 rounded-lg hover:border-primary-200 transition-colors">
                        <div className="w-16 h-16 bg-gray-100 rounded-md shrink-0"></div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-medium truncate">Set quà tặng Socola Handmade Premium</h4>
                           <div className="flex items-center gap-2 text-sm mt-1">
                              <span className="text-red-600 font-bold">299.000₫</span>
                              <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">+45k Hoa hồng</span>
                           </div>
                        </div>
                        <Button className="text-primary-600">Lấy Link</Button>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right: Sidebar Helper */}
         <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
               <h3 className="font-bold text-gray-800 mb-3">Hướng dẫn content</h3>
               <ul className="space-y-3">
                  <li className="flex gap-3 items-start text-sm text-gray-600">
                     <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/>
                     <span>Nên tập trung vào yếu tố "Quà tặng ý nghĩa", "Giao hàng nhanh 2h".</span>
                  </li>
                  <li className="flex gap-3 items-start text-sm text-gray-600">
                     <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/>
                     <span>Hashtag gợi ý: #Valentine2026 #QuaTangYeuThuong</span>
                  </li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
}