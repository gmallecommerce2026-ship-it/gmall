// File: src/modules/product-details/components/ShopInfoSkeleton.tsx
import React from 'react';

const ShopInfoSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 animate-pulse">
      {/* LEFT: Avatar & Name Skeleton */}
      <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto border-b md:border-b-0 pb-4 md:pb-0 md:border-r border-gray-100 md:pr-8">
        
        {/* Avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200"></div>
        
        <div className="flex flex-col gap-2">
          {/* Tên Shop */}
          <div className="h-5 bg-gray-200 rounded w-40"></div>
          {/* Online status */}
          <div className="h-3 bg-gray-200 rounded w-24 mt-1"></div>

          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            <div className="h-8 w-28 bg-gray-200 rounded-md"></div>
            <div className="h-8 w-28 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* RIGHT: Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 flex-1 w-full pl-0 md:pl-4">
          {[...Array(5)].map((_, index) => (
             <div key={index} className="flex justify-between md:justify-start gap-3">
                <span className="h-4 bg-gray-200 rounded w-20"></span>
                <span className="h-4 bg-gray-200 rounded w-12"></span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShopInfoSkeleton;