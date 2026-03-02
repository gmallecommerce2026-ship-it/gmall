// src/components/ProductGridSkeleton.tsx
import React from "react";
// [FIX] Cập nhật đường dẫn import chính xác
import ProductCardSkeleton from "./common/ProductCardSkeleton"; 

const ProductGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-full">
            <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;