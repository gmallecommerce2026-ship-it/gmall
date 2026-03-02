'use client'; // Đánh dấu đây là Client Component

import { useEffect } from 'react';
import { useContentStore } from '@/store/useContentStore';

export default function GlobalContentFetcher() {
  const { fetchAllGlobalContent } = useContentStore();

  useEffect(() => {
    fetchAllGlobalContent();
  }, []);

  return null; // Component này không render giao diện, chỉ chạy logic
}