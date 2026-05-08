"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import ProductCard from "@/modules/product/components/ProductCard";
import { ChevronRight } from "lucide-react";

interface LazyProductRowProps {
  title: string;
  productId: string;
  fetcher: (id: string) => Promise<any>;
  seeMoreLink?: string;
}

export const LazyProductRow: React.FC<LazyProductRowProps> = ({
  title,
  productId,
  fetcher,
  seeMoreLink,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetcher(productId);
      // Xử lý nếu API trả về { data: [] } hoặc [] trực tiếp
      const productList = Array.isArray(data) ? data : data?.data || [];
      setProducts(productList);
    } catch (error) {
      console.error(`Failed to load ${title}`, error);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [fetcher, productId, title]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasFetched) {
          loadData();
        }
      },
      { rootMargin: "200px" } // Load trước khi scroll tới 200px
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [productId, hasFetched, loadData]);

  // --- [FIX] Helper function xử lý ảnh "đa hệ" (string hoặc object) ---
  const getSafeImageUrl = (item: any) => {
    if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
        return item.imageUrl || item.image || "/assets/placeholder.png";
    }
    
    const firstImg = item.images[0];
    
    // Trường hợp 1: Mảng chuỗi ["url1", "url2"]
    if (typeof firstImg === 'string') return firstImg;
    
    // Trường hợp 2: Mảng object [{url: "url1"}, {url: "url2"}]
    if (typeof firstImg === 'object' && firstImg.url) return firstImg.url;

    return "/assets/placeholder.png";
  };

  if (hasFetched && products.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full py-6 md:py-10 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">
          {title}
        </h3>
        {seeMoreLink && (
          <a
            href={seeMoreLink}
            className="group flex items-center text-sm font-medium text-brand-orange hover:text-orange-700 transition-colors"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-square bg-gray-100 rounded-md animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => (
            <div key={p.id} className="h-full">
              <ProductCard
                id={p.id}
                // [FIX] Gọi hàm lấy ảnh an toàn
                image={getSafeImageUrl(p)} 
                title={p.name || p.title}
                // [FIX] Convert chuỗi sang số trước khi format tiền tệ
                price={Number(p.price).toLocaleString("vi-VN") + "đ"}
                originalPrice={p.original_price ? Number(p.original_price).toLocaleString("vi-VN") + "đ" : undefined}
                discount={p.discountPercent}
                sold={p.salesCount > 0 ? `Đã bán ${p.salesCount}` : (p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng')}
                location={p.location}
              /> 
            </div>
          ))}
        </div>
      )}
    </div>
  );
};