'use client';

import { useEffect } from 'react';
import { useContentStore } from '@/store/useContentStore';

export default function GlobalInit() {
  const { fetchAllGlobalContent } = useContentStore();

  useEffect(() => {
    fetchAllGlobalContent();
  }, []);

  return null; // Không render gì cả, chỉ chạy logic
}