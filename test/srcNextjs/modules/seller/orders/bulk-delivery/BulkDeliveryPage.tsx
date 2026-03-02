// src/modules/seller/orders/bulk-delivery/BulkDeliveryPage.tsx
'use client';

import React, { useState } from 'react';
import classNames from 'classnames';
import { FiChevronRight, FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';
import { OrderFilterSection } from './components/OrderFilterSection';
import { BulkActionPanel } from './components/BulkActionPanel';

interface BulkDeliveryPageProps {
  isEmbedded?: boolean; // Cờ báo hiệu đang nhúng vào dashboard cha
}

const BulkDeliveryPage = ({ isEmbedded = false }: BulkDeliveryPageProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'create'>('pending');

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* 1. Sticky Header */}
      {!isEmbedded && (
      <header className="bg-white shadow-sm sticky top-0 z-30 w-full px-8 h-[80px] flex items-center justify-between backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3 text-[15px] text-gray-500">
          <span className="hover:text-[#E78720] cursor-pointer transition-colors">Trang chủ</span> 
          <FiChevronRight className="text-gray-400" /> 
          <span className="text-gray-900 font-medium">Giao hàng loạt</span>
        </div>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 px-5 py-2.5 rounded-full w-[400px] border border-transparent focus-within:border-[#E78720] focus-within:bg-white transition-all">
             <FiSearch className="text-gray-400 mr-3 text-lg"/>
             <input type="text" placeholder="Tìm kiếm đơn hàng, mã vận đơn..." className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400" />
        </div>
      </header>
      )}
      {/* 2. Main Container (Layout 2 cột: Content | ActionPanel) */}
      <div className="flex flex-row items-start justify-center w-full max-w-[1920px] mx-auto">
        
        {/* Left Content Area */}
        <main className="flex-1 flex flex-col gap-6 p-6 md:p-8 min-w-0 max-w-[1200px]">
          
          {/* Page Title */}
          <h1 className="text-[32px] font-bold text-gray-900 leading-tight">Giao hàng loạt</h1>
            
          {/* Tabs */}
          <div className="flex items-end border-b border-gray-200 w-full mt-2">
              {['pending', 'create'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={classNames(
                    "px-6 py-3 text-lg font-medium transition-all relative top-[1px] border-b-[4px]",
                    activeTab === tab 
                      ? "text-[#E78720] border-[#E78720]" 
                      : "text-gray-500 border-transparent hover:text-[#E78720] hover:border-gray-200"
                  )}
                >
                  {tab === 'pending' ? 'Chờ giao hàng' : 'Tạo phiếu'}
                </button>
              ))}
          </div>

          {/* Filter Section */}
          <OrderFilterSection />

          {/* Sort Bar */}
          <div className="flex items-center justify-between mt-4">
             <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 text-[#2D80E2] font-medium hover:underline text-sm">
                    Mở rộng bộ lọc <FiChevronDown />
                 </button>
                 <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
                 <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FiFilter />
                    <span>Sắp xếp theo: Hạn gửi hàng (Xa - Gần nhất)</span>
                    <FiChevronDown className="cursor-pointer" />
                 </div>
             </div>
             <div className="text-xl font-light text-gray-900">
                 <span className="font-medium">0</span> kiện hàng
             </div>
          </div>

          {/* Data Table (Empty State) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px] flex flex-col mt-2">
             <div className="bg-gray-50 border-b border-gray-200 p-4 grid grid-cols-[40px_1fr_120px_120px_160px_180px_140px] gap-4 items-center text-sm font-semibold text-gray-700">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#E78720] focus:ring-[#E78720] cursor-pointer" />
                <span>Sản phẩm</span>
                <span>Mã đơn hàng</span>
                <span>Người mua</span>
                <span>ĐVVC</span>
                <span>Thời gian xác nhận</span>
                <span>Trạng thái</span>
                <span>Thao tác</span>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 py-20">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center shadow-inner">
                    <FiSearch className="w-8 h-8 text-gray-300" />
                </div>
                <span className="font-light">Không tìm thấy đơn hàng nào phù hợp</span>
             </div>
          </div>
        </main>

        {/* Right Sticky Action Panel */}
        <BulkActionPanel selectedCount={0} />

      </div>
    </div>
  );
};

export default BulkDeliveryPage;