// src/app/(admin)/admin/settings/banners/page.tsx
'use client';

import React from 'react';
import { FiUploadCloud, FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';

export default function BannerSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Banner & Marketing</h1>
        <button className="flex items-center gap-2 bg-[#E78720] text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-orange-600 transition-colors">
          <FiPlus /> Thêm Banner mới
        </button>
      </div>

      {/* Hero Carousel Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Trang chủ - Hero Carousel (Slide chính)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mock Banner Item 1 */}
            <div className="group relative aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">Image 1</div>
               <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Active</div>
               {/* Actions Overlay */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white rounded-full text-gray-800 hover:text-[#E78720]"><FiEdit2/></button>
                  <button className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"><FiTrash2/></button>
               </div>
            </div>

            {/* Mock Banner Item 2 */}
            <div className="group relative aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">Image 2</div>
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white rounded-full text-gray-800 hover:text-[#E78720]"><FiEdit2/></button>
                  <button className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"><FiTrash2/></button>
               </div>
            </div>

            {/* Add New Placeholder */}
            <div className="aspect-[16/9] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[#E78720] hover:text-[#E78720] transition-colors">
               <FiUploadCloud size={32} />
               <span className="text-sm mt-2 font-medium">Tải ảnh lên</span>
            </div>
        </div>
      </section>

      {/* Sub Banner Section */}
      <section className="space-y-4 pt-6 border-t border-gray-100">
         <h2 className="text-lg font-bold text-gray-700">Banner Phụ (Sidebar/Footer)</h2>
         <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Chưa có banner phụ nào được cấu hình.
         </div>
      </section>
    </div>
  );
}