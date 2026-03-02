// src/app/(blog)/components/BlogLayoutHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogHeader } from '@/modules/blog/components/BlogHeader';
import { BlogCategory } from '@/services/blog.service';
import { useDebounce } from '@/hooks/useDebounce';

interface Props {
  categories: BlogCategory[];
}

export default function BlogLayoutHeader({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy giá trị từ URL để hiển thị lên UI ban đầu
  const initialSearch = searchParams.get('search') || '';
  const initialCat = searchParams.get('category') || '';

  const [searchValue, setSearchValue] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchValue, 500);

  // Xử lý khi chọn danh mục -> Đẩy lên URL
  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    // Reset search khi chọn danh mục để tránh rối
    params.delete('search');
    setSearchValue('');
    
    // Điều hướng về trang chủ blog với tham số mới
    router.push(`/blog?${params.toString()}`);
  };

  // Xử lý khi search -> Đẩy lên URL (Sử dụng debounce để tránh push liên tục)
  useEffect(() => {
    // Chỉ push nếu giá trị khác với URL hiện tại
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
       const params = new URLSearchParams(searchParams.toString());
       if (debouncedSearch) {
         params.set('search', debouncedSearch);
       } else {
         params.delete('search');
       }
       router.push(`/blog?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  return (
    <BlogHeader 
      categories={categories}
      onSearch={setSearchValue} 
      searchValue={searchValue}
      onCategorySelect={handleCategorySelect}
    />
  );
}