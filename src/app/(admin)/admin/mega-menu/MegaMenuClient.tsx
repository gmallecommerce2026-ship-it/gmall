'use client';

import React from 'react';
import { FiList, FiInfo } from 'react-icons/fi';
import CategoryTreeManager from '@/components/admin/content/CategoryTreeManager';

export default function MegaMenuClient() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiList className="text-orange-500" />
            Quản Lý Mega Menu
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cấu hình cấu trúc danh mục sản phẩm hiển thị trên Menu chính của trang chủ.
          </p>
        </div>
        
        {/* Có thể thêm nút hành động nhanh ở đây nếu cần sau này */}
      </div>

      {/* Info Card - UX Improvement */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start text-blue-800 text-sm">
        <FiInfo className="mt-0.5 shrink-0 text-blue-600" size={18} />
        <div>
            <p className="font-semibold mb-1">Hướng dẫn nhanh:</p>
            <ul className="list-disc pl-4 space-y-1 text-blue-700/80">
                <li>Kéo thả để sắp xếp lại thứ tự các danh mục.</li>
                <li>Cấu trúc cây danh mục sẽ ảnh hưởng trực tiếp đến thanh điều hướng (Navigation Bar).</li>
                <li>Hãy đảm bảo lưu lại các thay đổi sau khi chỉnh sửa.</li>
            </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden">
         {/* Nhúng component quản lý cây danh mục cũ vào đây */}
         <CategoryTreeManager />
      </div>
    </div>
  );
}