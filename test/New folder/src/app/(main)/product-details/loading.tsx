import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-3">
      {/* Skeleton mô phỏng trang Product Detail */}
      <div className="w-full max-w-[1340px] px-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col lg:flex-row gap-8">
           <div className="w-full lg:w-2/5 h-[400px] bg-gray-200 rounded-lg"></div>
           <div className="w-full lg:w-3/5 flex flex-col gap-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-20 w-full bg-gray-100 rounded mt-4"></div>
           </div>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-4 font-medium">Đang tải chi tiết sản phẩm...</p>
    </div>
  );
}