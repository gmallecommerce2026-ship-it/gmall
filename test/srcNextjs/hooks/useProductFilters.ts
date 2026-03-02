// src/hooks/useProductFilters.ts
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface FilterState {
  sort: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  locations: string[];
  brands: string[];
  category?: string;
}

export const useProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Lấy state hiện tại từ URL
  const filters = useMemo(() => {
    const query = searchParams.get('q') || '';
    
    return {
      query,
      // Chỉ giữ lại logic mới này
      sort: searchParams.get('sort') || (query ? '' : 'newest'),
      
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      rating: searchParams.get('rating') || '',
      locations: searchParams.get('locations')?.split(',').filter(Boolean) || [],
      brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
      category: searchParams.get('categorySlug') || '',
    };
  }, [searchParams]);
  
  // 2. Hàm update URL
  const updateFilter = useCallback((newParams: Partial<FilterState>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, value]) => {
      // Xử lý xóa param nếu value rỗng hoặc null
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        current.delete(key);
      } else {
        if (Array.isArray(value)) {
           // Join mảng thành chuỗi (vd: locations=HCM,HN)
           if (value.length > 0) current.set(key, value.join(','));
           else current.delete(key);
        } else {
          current.set(key, String(value));
        }
      }
    });

    // [QUAN TRỌNG] Reset về trang 1 mỗi khi thay đổi bộ lọc/sort
    if (newParams.sort || newParams.minPrice || newParams.locations) {
        current.set('page', '1');
    }

    const search = current.toString();
    const queryStr = search ? `?${search}` : '';

    router.push(`${window.location.pathname}${queryStr}`, { scroll: false });
  }, [searchParams, router]);

  // 3. Các handler
  const setSort = (sortType: string) => updateFilter({ sort: sortType });
  const setPriceRange = (min: string, max: string) => updateFilter({ minPrice: min, maxPrice: max });
  const setRating = (rating: number) => updateFilter({ rating: rating.toString() });
  
  const toggleLocation = (loc: string) => {
    const currentLocs = new Set(filters.locations);
    if (currentLocs.has(loc)) currentLocs.delete(loc);
    else currentLocs.add(loc);
    updateFilter({ locations: Array.from(currentLocs) });
  };

  const clearAll = () => {
    // Giữ lại query khi clear filter
    const q = filters.query;
    router.push(`${window.location.pathname}${q ? `?q=${q}` : ''}`);
  };

  return {
    filters,
    setSort,
    setPriceRange,
    toggleLocation,
    setRating,
    clearAll,
    updateFilter
  };
};