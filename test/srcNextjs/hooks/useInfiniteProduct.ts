// src/hooks/useInfiniteProduct.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api/ApiClient';

// Định nghĩa Interface rõ ràng cho Filter
interface ProductFilters {
  search?: string;
  category?: string;
  // Các filter khác có thể mở rộng sau này (brand, priceRange...)
}

// Interface Product giữ nguyên
interface Product {
  id: string;
  variant: "flash-sale" | "regular";
  imageUrl: string;
  title: string;
  price?: string;
  regularPrice?: string;
  discountPercent?: string;
  rating?: number;
  salesCount?: string;
  location?: string;
  stockRemaining?: number;
  stockTotal?: number;
}

export const useInfiniteProduct = (initialLimit = 12, filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Ref để tracking component unmount hoặc query change
  const isFirstRun = useRef(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Reset list khi filters thay đổi (Search query đổi -> Reset list)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [filters.search, filters.category]);

  const fetchProducts = async (pageNum: number) => {
    setLoading(true);
    try {
      // Build query string an toàn
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: initialLimit.toString(),
      });
      
      if (filters.search) params.append('q', filters.search);
      if (filters.category) params.append('category', filters.category);

      const res = await apiClient.get(`/store/products?${params.toString()}`);
      
      if (res && res.data) {
        const newProducts = res.data.map((p: any) => ({
          id: p.id,
          title: p.name,
          imageUrl: Array.isArray(p.images) ? (p.images[0]?.url || p.images[0]) : p.images,
          variant: p.variant || "regular", 
          regularPrice: p.price.toLocaleString('vi-VN') + " VND",
          price: p.discountPercent ? (p.price * (1 - p.discountPercent / 100)).toLocaleString('vi-VN') + " VND" : undefined,
          discountPercent: p.discountPercent,
          salesCount: p.salesCount || "0",
          rating: p.rating || 0,
          location: "Hà Nội", 
          stockRemaining: p.stock,
          stockTotal: 100,
        }));

        setProducts((prev) => (pageNum === 1 ? newProducts : [...prev, ...newProducts]));
        // Logic check hasMore: Nếu số lượng trả về < limit -> Hết data
        setHasMore(newProducts.length === initialLimit && pageNum < (res.meta?.last_page || 999));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fail safe
      if (pageNum === 1) setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.search, filters.category]); // Thêm dependencies quan trọng

  const lastProductRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return { products, loading, hasMore, lastProductRef };
};