import React from "react";
import Skeleton from "@/components/ui/Skeleton";

const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb fake */}
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: GALLERY (5 phần) --- */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              <Skeleton className="w-full h-full" />
            </div>
            {/* Thumbnails Row */}
            <div className="flex gap-3 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* --- RIGHT: INFO (7 phần) --- */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Title & Rating */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-full lg:w-3/4" /> {/* Title Line 1 */}
              <Skeleton className="h-8 w-1/2" />          {/* Title Line 2 */}
              
              <div className="flex items-center gap-4 mt-2">
                <Skeleton className="h-4 w-32" /> {/* Rating */}
                <span className="w-[1px] h-4 bg-gray-200"></span>
                <Skeleton className="h-4 w-24" /> {/* Sold */}
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
               <Skeleton className="h-10 w-48" />
            </div>

            {/* Vouchers/Promos */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </div>

            {/* Variants (Color/Size) */}
            <div className="space-y-4 py-2">
              {[1, 2].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-3" /> {/* Label */}
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-20 rounded-md" />
                    <Skeleton className="h-10 w-20 rounded-md" />
                    <Skeleton className="h-10 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex gap-3 h-12">
                 <Skeleton className="flex-1 h-full rounded-md" /> {/* Add to cart */}
                 <Skeleton className="flex-1 h-full rounded-md" /> {/* Buy now */}
              </div>
              <Skeleton className="w-full h-11 rounded-md" /> {/* Gift */}
            </div>

          </div>
        </div>
      </div>
      
      {/* Description / Related Products Fake */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-3 space-y-4">
               <Skeleton className="h-6 w-40 mb-4" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-2/3" />
               <Skeleton className="h-64 w-full rounded-lg mt-4" />
           </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;