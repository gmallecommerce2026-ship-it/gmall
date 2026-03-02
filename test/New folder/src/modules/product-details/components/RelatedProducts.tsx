// src/modules/product-detail/components/RelatedProducts.tsx
import React from "react";
// *** TÁI SỬ DỤNG CARD TỪ TRANG PRODUCT NHƯ BẠN YÊU CẦU ***
import ProductGridCard from "@/modules/product/components/ProductGridCard";

// Định nghĩa lại kiểu Product (hoặc import từ file chung nếu có)
interface Product {
  id: string;
  variant: "flash-sale" | "regular";
  imageUrl: string;
  title: string;
  price?: string;
  discountPercent?: string;
  countdown?: { hours: string | number; minutes: string | number; seconds: string | number };
  stockRemaining?: number;
  stockTotal?: number;
  regularPrice?: string;
  smallTag?: string;
  salesCount?: string;
  rating?: number;
  location?: string;
}

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-3xl font-bold text-brand-dark-green mb-6">
        Sản phẩm liên quan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          // Chỉ render card kiểu "regular" cho sản phẩm liên quan
          <ProductGridCard
            key={product.id}
            // THÊM DÒNG NÀY:
            id={product.id}
            variant="regular" // Ép kiểu là regular
            imageUrl={product.imageUrl}
            title={product.title}
            regularPrice={product.regularPrice}
            smallTag={product.smallTag}
            salesCount={product.salesCount}
            rating={product.rating}
            location={product.location}
            price={""} // Bỏ các props của flash-sale
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;