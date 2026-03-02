// src/modules/product/SearchProductPage.tsx
"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image"; // Dùng Image của Next để tối ưu
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductSortBar from "@/modules/product/components/ProductSortBar";
import ProductFilterSidebar from "@/modules/product/components/ProductFilterSidebar";
import ProductGridCard from "@/modules/product/components/ProductGridCard";
import { useInfiniteProduct } from "@/hooks/useInfiniteProduct";

const SearchProductPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // Lấy query từ URL

  // Pass query vào hook để fetch data real-time
  const { products, loading, hasMore, lastProductRef } = useInfiniteProduct(12, {
    search: query,
  });

  const breadcrumbItems = useMemo(() => [
    { name: "Trang chủ", href: "/" },
    { name: "Tìm kiếm", href: "/search" },
    { name: `Kết quả cho "${query}"`, href: "#" },
  ], [query]);

  // UI Empty State khi không tìm thấy kết quả
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 w-full bg-white rounded-lg shadow-sm">
        <div className="relative w-40 h-40 mb-4 opacity-70">
            {/* Bạn có thể thay bằng icon search svg có sẵn trong project */}
            <Image 
                src="/icons/box-open.svg" // Placeholder, hãy đổi thành icon hợp lý
                alt="No result"
                fill
                className="object-contain"
            />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h3>
        <p className="text-gray-500 text-center max-w-md">
            Rất tiếc, chúng tôi không tìm thấy sản phẩm phù hợp với từ khóa 
            <span className="font-semibold text-brand-orange mx-1">"{query}"</span>.
        </p>
        <p className="text-gray-400 text-sm mt-2">Hãy thử lại với từ khóa chung chung hơn.</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen">
      <div className="w-full max-w-[1340px] mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Dynamic Title */}
        <ProductSortBar 
            title={query ? `KẾT QUẢ TÌM KIẾM: "${query.toUpperCase()}"` : "TÌM KIẾM SẢN PHẨM"} 
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-8">
          {/* Sidebar - Vẫn giữ để user filter sâu hơn trong kết quả tìm kiếm */}
          <div className="w-full lg:w-[333px] flex-shrink-0 hidden lg:block">
            <ProductFilterSidebar />
          </div>

          {/* Product List */}
          <div className="flex-1 min-w-0">
            {products.length === 0 && !loading ? (
                renderEmptyState()
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product, index) => {
                    const isLastElement = products.length === index + 1;
                    const productProps = {
                        ...product,
                        price: product.price || "",
                    };

                    if (isLastElement) {
                    return (
                        <div ref={lastProductRef} key={`${product.id}-${index}`}>
                            <ProductGridCard {...productProps} />
                        </div>
                    );
                    }
                    return <ProductGridCard key={`${product.id}-${index}`} {...productProps} />;
                })}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="w-full py-12 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {!hasMore && products.length > 0 && (
               <div className="text-center py-8">
                   <span className="text-gray-400 bg-gray-100 px-4 py-2 rounded-full text-sm">
                       Đã hiển thị tất cả kết quả
                   </span>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProductPage;