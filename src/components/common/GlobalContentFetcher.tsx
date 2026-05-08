'use client'; // Đánh dấu đây là Client Component

import { useEffect } from 'react';
import { useContentStore } from '@/store/useContentStore';

export default function GlobalContentFetcher() {
  const { fetchAllGlobalContent } = useContentStore();

  // hooks-fix wiki 0031: include Zustand action — identity ổn định nên không gây re-run
  useEffect(() => {
    fetchAllGlobalContent();
  }, [fetchAllGlobalContent]);

  return null; // Component này không render giao diện, chỉ chạy logic
}