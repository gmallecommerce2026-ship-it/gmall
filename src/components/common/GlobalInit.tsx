'use client';

import { useEffect } from 'react';
import { useContentStore } from '@/store/useContentStore';

export default function GlobalInit() {
  const { fetchAllGlobalContent } = useContentStore();

  // hooks-fix wiki 0031: include Zustand action — identity ổn định
  useEffect(() => {
    fetchAllGlobalContent();
  }, [fetchAllGlobalContent]);

  return null; // Không render gì cả, chỉ chạy logic
}