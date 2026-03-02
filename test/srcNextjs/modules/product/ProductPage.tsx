// src/modules/product/ProductPage.tsx
"use client";

import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PromoBanner from "@/modules/product/components/PromoBanner";
import ProductSortBar from "@/modules/product/components/ProductSortBar";
import ProductFilterSidebar from "@/modules/product/components/ProductFilterSidebar";
import ProductGridCard from "@/modules/product/components/ProductGridCard";
import ProductAboutSection from "@/modules/product/components/ProductAboutSection";
import { useInfiniteProduct } from "@/hooks/useInfiniteProduct";

const ProductPage = () => {
  const { products, loading, hasMore, lastProductRef } = useInfiniteProduct();

  const breadcrumbItems = [
    { name: "Trang chủ", href: "/" },
    { name: "SẢN PHẨM", href: "/product" },
  ];

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen">
      <div className="w-full max-w-[1340px] mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        <PromoBanner />
        <ProductSortBar title="TẤT CẢ SẢN PHẨM" />

        <div className="flex flex-col lg:flex-row gap-6 mt-8">
          {/* Sidebar */}
          <div className="w-full lg:w-[333px] flex-shrink-0 hidden lg:block">
            <ProductFilterSidebar />
          </div>

          {/* Product Grid - Infinite Scroll */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product, index) => {
                const isLastElement = products.length === index + 1;
                
                // Chuẩn hóa props trước khi truyền để tránh lỗi TS
                const productProps = {
                    ...product,
                    price: product.price || "", // Fallback an toàn
                };

                if (isLastElement) {
                  return (
                    <div ref={lastProductRef} key={product.id}>
                      <ProductGridCard {...productProps} />
                    </div>
                  );
                }
                return <ProductGridCard key={product.id} {...productProps} />;
              })}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="w-full py-8 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {!hasMore && products.length > 0 && (
               <div className="text-center py-8 text-gray-500">Đã hiển thị tất cả sản phẩm.</div>
            )}
          </div>
        </div>

        <ProductAboutSection />
      </div>
    </div>
  );
};

export default ProductPage;