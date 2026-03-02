"use client";

import React, { useEffect, useRef, useState } from "react";
import ProductCard from "@/modules/product/components/ProductCard"; // Adjust path if needed
import { ChevronRight } from "lucide-react"; // Or use your own icon

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasFetched) {
          loadData();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [productId, hasFetched]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetcher(productId);
      // Handle different response structures (array or object with data property)
      const productList = Array.isArray(data) ? data : data?.data || [];
      setProducts(productList);
    } catch (error) {
      console.error(`Failed to load ${title}`, error);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  // If fetched and empty, hide the section
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
        // --- SKELETON LOADING STATE ---
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
        // --- REAL DATA ---
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => (
            <div key={p.id} className="h-full">
               {/* Map your API data to ProductCard props */}
              <ProductCard
                id={p.id}
                image={p.images?.[0].url || p.image || "/placeholder.png"}
                title={p.name || p.title}
                price={p.price?.toLocaleString("vi-VN") + "đ"}
                originalPrice={p.originalPrice ? p.originalPrice.toLocaleString("vi-VN") + "đ" : undefined}
                discount={p.discount}
                sold={p.salesCount || p.sold}
                location={p.location} // Ensure your backend sends this if needed
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};