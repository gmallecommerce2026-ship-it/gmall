// src/modules/product/components/ProductGrid.tsx

import React from "react";
import ProductGridCard from "@/modules/product/components/ProductGridCard"; 
import Button from "@/components/ui/Button";

interface Product {
  id: string;
  variant: "flash-sale" | "regular";
  imageUrl: string;
  title: string;
  // Flash-sale props
  price?: string;
  discountPercent?: string;
  countdown?: { hours: string | number; minutes: string | number; seconds: string | number };
  stockRemaining?: number;
  stockTotal?: number;
  // Regular props
  regularPrice?: string;
  smallTag?: string;
  salesCount?: string;
  rating?: number;
  location?: string;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Lưới Sản Phẩm: gap-2 để sát nhau */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {products.map((product) => (
          <ProductGridCard
            key={product.id}
            id={product.id} 
            variant={product.variant}
            imageUrl={product.imageUrl}
            title={product.title}
            // Props Flash Sale
            price={product.price ? product.price.toString() : ""}
            discountPercent={product.discountPercent}
            countdown={product.countdown}
            stockRemaining={product.stockRemaining}
            stockTotal={product.stockTotal}
            // Props Regular
            regularPrice={product.regularPrice}
            smallTag={product.smallTag}
            salesCount={product.salesCount}
            rating={product.rating}
            location={product.location}
          />
        ))}
      </div>

      {/* Nút Xem Thêm */}
      <Button variant="primary" className="px-8">Xem thêm</Button>
    </div>
  );
};

export default ProductGrid;