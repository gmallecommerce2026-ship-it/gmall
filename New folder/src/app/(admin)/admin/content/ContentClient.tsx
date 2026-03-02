// src/app/(admin)/admin/content/ContentClient.tsx
'use client';

import React, { useState } from 'react';
import { FiPlus, FiEdit3, FiEye, FiTrash, FiFileText, FiImage, FiGrid } from 'react-icons/fi';
import classNames from 'classnames';

export default function ContentClient() {
  const [activeTab, setActiveTab] = useState('articles'); // articles | banners | policy

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý nội dung</h1>
            <p className="text-sm text-gray-500 mt-1">Đăng bài viết blog, thông báo và cấu hình trang chủ.</p>
        </div>
        <button className="bg-[#E78720] hover:bg-[#cf761a] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
            <FiPlus size={18} /> Tạo mới
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
            {['articles', 'banners', 'policy'].map((tab) => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={classNames(
                        "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                        activeTab === tab 
                            ? "border-[#E78720] text-[#E78720]" 
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    {tab === 'articles' && 'Bài viết & Blog'}
                    {tab === 'banners' && 'Banner Quảng cáo'}
                    {tab === 'policy' && 'Chính sách & Điều khoản'}
                </button>
            ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List Content Item */}
        {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gray-100 relative">
                    {/* Placeholder Image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <FiImage size={40} />
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-600 shadow-sm">
                        24/12/2025
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">Blog</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded">Public</span>
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-[#E78720] transition-colors">
                        Gợi ý 10 món quà ý nghĩa cho ngày Valentine 2026
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        Valentine là dịp đặc biệt để bày tỏ tình cảm. Hãy cùng LoveGifts khám phá những món quà...
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <span className="flex items-center gap-1"><FiEye /> 1.2k</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-500 hover:text-[#E78720] hover:bg-orange-50 rounded-lg transition-colors">
                                <FiEdit3 size={16} />
                            </button>
                             <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <FiTrash size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}