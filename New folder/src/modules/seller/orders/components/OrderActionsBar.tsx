// src/modules/seller/orders/components/OrderActionsBar.tsx
import React from 'react';
import { FiSearch, FiRefreshCw, FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';

const OrderActionsBar = () => {
  return (
    <div className="flex flex-col gap-4 w-full bg-white rounded-lg">
      
      {/* Search Inputs Row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border border-gray-200 p-1 rounded-lg">
        {/* Dropdown Type */}
        <div className="relative flex items-center w-full md:w-[200px] border-r border-gray-200 px-4 py-2 hover:bg-gray-50 cursor-pointer group">
            <span className="flex-1 text-gray-700 text-sm">Tìm yêu cầu</span>
            <FiChevronDown className="text-gray-400 group-hover:text-[#E78720]" />
        </div>

        {/* Search Input */}
        <div className="flex-1 flex items-center px-4 py-2 w-full">
            <input 
                type="text" 
                placeholder="Điền mã yêu cầu, tên khách hàng..." 
                className="w-full outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
            />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 p-1">
             <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-medium transition-colors">
                <FiRefreshCw className="text-lg" />
                <span className="hidden md:inline">Đặt lại</span>
             </button>
             <button className="flex items-center gap-2 px-8 py-2.5 bg-[#E78720] hover:bg-[#d17515] text-white rounded text-sm font-medium shadow-md transition-all active:scale-95">
                <FiSearch className="text-lg" />
                Tìm kiếm
             </button>
        </div>
      </div>

      {/* Bulk Actions Row */}
      <div className="flex items-center justify-between mt-2">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#E78720] focus:ring-[#E78720]" />
                <span className="text-sm font-medium text-gray-900">0 kiện hàng</span>
            </div>
            
            <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
            
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E78720] transition-colors">
                <span>Sắp xếp theo</span>
                <FiChevronDown />
            </button>
         </div>

         <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded text-sm hover:border-[#E78720] hover:text-[#E78720] transition-colors bg-white">
                 <span>Toàn bộ thao tác</span>
                 <FiChevronDown />
             </button>
             
             <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded text-sm hover:border-[#E78720] hover:text-[#E78720] transition-colors bg-white">
                 <FiDownload />
                 <span>Export</span>
             </button>
         </div>
      </div>
    </div>
  );
};

export default OrderActionsBar;