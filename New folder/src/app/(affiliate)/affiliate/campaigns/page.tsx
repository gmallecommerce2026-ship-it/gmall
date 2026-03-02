'use client';
import React from 'react';
import { Search, Calendar, ArrowRight, Gift, Percent } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CampaignsPage() {
  return (
    <div className="space-y-8">
      {/* 1. Hero Banner Chiến dịch nổi bật */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-red-800 text-white p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider">
            Sự kiện Hot
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Đại tiệc Giáng Sinh <br/> Hoa hồng nhân đôi 🎄
          </h1>
          <p className="text-red-100 text-lg">
            Nhận thêm 5% hoa hồng cho tất cả đơn hàng thuộc danh mục Quà tặng & Thời trang.
            Thời gian: 01/12 - 25/12.
          </p>
          <div className="pt-4">
            <Link href="/campaigns/xmas-2025">
              <Button className="bg-white text-red-700 hover:bg-gray-100 border-none">
                Tham gia ngay
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Chiến dịch đang diễn ra</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
             <input 
               placeholder="Tìm chiến dịch..." 
               className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-primary-500"
             />
          </div>
          <select className="px-3 py-2 border rounded-lg text-sm bg-white outline-none">
             <option>Mới nhất</option>
             <option>Hoa hồng cao nhất</option>
             <option>Sắp kết thúc</option>
          </select>
        </div>
      </div>

      {/* 3. Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <CampaignCard key={item} id={item} />
        ))}
      </div>
    </div>
  );
}

const CampaignCard = ({ id }: { id: number }) => (
  <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
    {/* Thumbnail */}
    <div className="h-40 bg-gray-100 relative">
      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
        <Percent size={12}/> +5% Comm
      </div>
      {/* <Image ... /> Place holder */}
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
         Campaign Thumbnail {id}
      </div>
    </div>
    
    {/* Content */}
    <div className="p-5 flex-1 flex flex-col">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
           <Calendar size={14}/> 01/12 - 31/12/2025
        </div>
        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
          Siêu sale Valentine 2026
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          Đẩy số các sản phẩm Chocolate và Hoa tươi. Thưởng nóng 500k cho mỗi mốc 10 đơn hàng thành công.
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
         <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <Gift size={16}/> Có thưởng thêm
         </div>
         <Link href={`/campaigns/${id}`}>
            <Button variant="outline" className="group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200">
              Chi tiết <ArrowRight size={14} className="ml-1"/>
            </Button>
         </Link>
      </div>
    </div>
  </div>
);