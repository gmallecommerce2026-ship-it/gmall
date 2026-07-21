"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PromoBanner from "@/modules/product/components/PromoBanner";
import ProductSortBar from "@/modules/product/components/ProductSortBar";
import ProductFilterSidebar from "@/modules/product/components/ProductFilterSidebar";
import ProductGridCard from "@/modules/product/components/ProductGridCard";
import ProductAboutSection from "@/modules/product/components/ProductAboutSection";
import { useInfiniteProduct } from "@/hooks/useInfiniteProduct";
import { CategoryService } from "@/services/category.service";
import { useProductFilters } from "@/hooks/useProductFilters";

const ProductPageContent = () => {
  const { products, loading, hasMore, lastProductRef } = useInfiniteProduct();
  const searchParams = useSearchParams();
  
  // Đọc param categorySlug dựa theo format của getSearchUrl / useProductFilters
  const categorySlug = searchParams.get("categorySlug");
  const { updateFilter } = useProductFilters();

  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [childCategories, setChildCategories] = useState<any[]>([]);

  // Khi URL có categorySlug, gọi API lấy info Category đó + list Children
  // Nếu không có, hiển thị danh sách tất cả Danh mục gốc
  useEffect(() => {
    if (categorySlug) {
      CategoryService.getBySlug(categorySlug)
        .then((data) => {
          if (data) {
            setCurrentCategory({ id: data.id, name: data.name, slug: data.slug });
            setChildCategories(data.children || []);
          }
        })
        .catch((err) => {
          console.error("Lỗi fetch category:", err);
          setCurrentCategory(null);
          setChildCategories([]);
        });
    } else {
      // ✅ SỬA LẠI NHÁNH NÀY: Gọi getTree() thay vì set null
      CategoryService.getTree()
        .then((data) => {
          // Tạo một danh mục ảo đại diện cho Root
          setCurrentCategory({ id: 'root', name: 'TẤT CẢ DANH MỤC', slug: '' });
          // getTree trả về list level 1, đưa vào childCategories để render
          setChildCategories(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Lỗi fetch root categories:", err);
          setCurrentCategory(null);
          setChildCategories([]);
        });
    }
  }, [categorySlug]);

  // Xử lý khi user chọn một category con trong Sidebar
  const handleCategoryChange = (categoryId: string) => {
    const selectedCat = childCategories.find((c) => c.id === categoryId);
    if (selectedCat && selectedCat.slug) {
      // Ép kiểu as any vì hook updateFilter nhận key linh động map xuống URL
      updateFilter({ categorySlug: selectedCat.slug } as any);
    }
  };

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
            {/* Truyền đúng props xuống ProductFilterSidebar mà không sửa Component đó */}
            <ProductFilterSidebar 
              currentCategory={currentCategory}
              childCategories={childCategories}
              selectedCategoryId={null} 
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Product Grid - Infinite Scroll */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product, index) => {
                const isLastElement = products.length === index + 1;
                const productProps = {
                  ...product,
                  price: product.price || "",
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

const ProductPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProductPageContent />
    </Suspense>
  );
};

export default ProductPage;