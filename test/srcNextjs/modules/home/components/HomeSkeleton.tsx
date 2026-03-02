import React from "react";
import Skeleton from "@/components/ui/Skeleton";

const HomeSkeleton = () => {
  return (
    <div className="w-full bg-gray-50 mb-8 animate-pulse">
      <div className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* --- CỘT TRÁI (8 phần) --- */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Main Hero Banner */}
            {/* Giả lập chiều cao giống calc(100vh-376px) nhưng set min-height cố định cho đẹp */}
            <Skeleton className="w-full h-[300px] lg:h-[450px] rounded-lg" />

            {/* Sub Carousel */}
            <div className="grid grid-cols-3 gap-2 h-[100px]">
               <Skeleton className="h-full rounded-[4px]" />
               <Skeleton className="h-full rounded-[4px]" />
               <Skeleton className="h-full rounded-[4px]" />
            </div>
          </div>

          {/* --- CỘT PHẢI (4 phần) --- */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="flex flex-col gap-4 h-full">
              {/* Top Banner Right */}
              <Skeleton className="flex-1 rounded-lg" />
              {/* Bottom Banner Right */}
              <Skeleton className="flex-1 rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Fake Category Section */}
        <div className="mt-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="w-16 h-16 rounded-[20px]" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;