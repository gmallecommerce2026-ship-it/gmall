import React from "react";
import Skeleton from "@/components/ui/Skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-[4px] border border-gray-100 overflow-hidden h-full">
      {/* Image Area - Aspect Square */}
      <div className="relative w-full aspect-square bg-gray-100">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Content Area */}
      <div className="p-2.5 flex flex-col flex-1 gap-2">
        {/* Title - 2 dòng */}
        <div className="space-y-1.5 mb-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Tags / Promo */}
        <Skeleton className="h-3 w-16 mb-1" />

        {/* Price Area */}
        <div className="flex items-baseline gap-2 mt-auto">
          <Skeleton className="h-6 w-24" /> {/* Giá chính */}
          <Skeleton className="h-3 w-12" /> {/* Giá cũ */}
        </div>

        {/* Footer (Rating & Sold) */}
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;