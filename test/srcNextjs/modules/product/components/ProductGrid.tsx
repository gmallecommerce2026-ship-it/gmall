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
  originalPrice?: string | number;
  isDiscountActive?: boolean;
  discountType?: string;
  discountValue?: number;
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
  [key: string]: any; 
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {products.map((product) => (
          <ProductGridCard
            key={product.id}
            // 1. Giữ lại spread để truyền các props phụ khác
            {...product}
            
            // 2. Map lại các field cơ bản
            id={product.id} 
            variant={product.variant}
            imageUrl={product.imageUrl}
            title={product.title}
            
            // 3. QUAN TRỌNG: Truyền object gốc vào prop 'product' để component con dùng làm fallback
            product={product} 
            
            // 4. Xử lý giá bán (Final Price)
            price={product.price ? product.price.toString() : ""}
            
            // 5. CẬP NHẬT: Truyền tường minh các thông tin giảm giá
            // Ưu tiên truyền originalPrice gốc từ API để component con tự tính toán
            originalPrice={product.originalPrice}
            regularPrice={product.regularPrice} // Truyền riêng, không gộp logic || ở đây để con tự xử lý
            
            // Truyền cờ kích hoạt và thông số giảm giá
            isDiscountActive={product.isDiscountActive}
            discountType={product.discountType}
            discountValue={product.discountValue}
            discountPercent={product.discountPercent}
          />
        ))}
      </div>

      <Button variant="primary" className="px-8">Xem thêm</Button>
    </div>
  );
};

export default ProductGrid;