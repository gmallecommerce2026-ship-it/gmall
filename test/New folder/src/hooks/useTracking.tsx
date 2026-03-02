// src/hooks/useTracking.tsx
"use client";

import React, { useCallback, useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/ApiClient';

export enum EventType {
  VIEW_PAGE = 'view_page',
  VIEW_PRODUCT = 'view_product',
  CLICK_PRODUCT = 'click_product',
  ADD_TO_CART = 'add_to_cart',
  SEARCH = 'search',
  FILTER_PRODUCTS = 'filter_products',
  BEGIN_CHECKOUT = 'begin_checkout',
  PURCHASE = 'purchase', 
  IDENTIFY = 'identify', 
  ADD_SHIPPING_INFO = 'add_shipping_info',
  CLICK_PLACE_ORDER = 'click_place_order',
  VIEW_ORDER_SUCCESS = 'view_order_success'
}

const BATCH_LIMIT = 5; 
const TIME_LIMIT = 3000; 

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let eventQueue: any[] = [];
let timer: NodeJS.Timeout | null = null;

export const useTracking = () => {
  // LƯU Ý: Không gọi useSearchParams ở đây để tránh lỗi build cho các component static
  const pathname = usePathname(); 
  const deviceIdRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        let storedId = localStorage.getItem('tracking_device_id');
        if (!storedId) {
            storedId = generateUUID();
            localStorage.setItem('tracking_device_id', storedId);
        }
        deviceIdRef.current = storedId;
    }
  }, []);

  const flushQueue = useCallback(() => {
    if (eventQueue.length === 0) return;
    
    const batchToSend = [...eventQueue];
    eventQueue = [];
    
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    const currentDeviceId = deviceIdRef.current || (typeof window !== 'undefined' ? localStorage.getItem('tracking_device_id') : '');
    
    const blob = new Blob([JSON.stringify({ events: batchToSend })], { type: 'application/json' });
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/tracking/batch?deviceId=${currentDeviceId}`;

    if (navigator.sendBeacon) {
        navigator.sendBeacon(url, blob);
    } else {
        apiClient.sendBeacon('/tracking/batch', { events: batchToSend }, { 'x-device-id': currentDeviceId || '' });
    }
  }, []);

  const track = useCallback((type: EventType | string, targetId: string, metadata: any = {}) => {
    if (typeof window === 'undefined') return;

    const payload = {
      id: generateUUID(),
      type,
      targetId: targetId || 'none',
      metadata: {
        ...metadata,
        url: window.location.href, // Lấy full URL (gồm query param) trực tiếp từ window
        path: window.location.pathname,
        referrer: document.referrer || 'direct',
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    eventQueue.push(payload);

    if (eventQueue.length >= BATCH_LIMIT) {
      flushQueue(); 
    } else if (!timer) {
      timer = setTimeout(flushQueue, TIME_LIMIT);
    }
  }, [flushQueue]);

  return { track, flushQueue };
};

// Component con để lắng nghe thay đổi URL (Page View)
// Component này SẼ dùng useSearchParams nên cần bọc Suspense
const PageViewTracker = () => {
    const { track } = useTracking();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // An toàn khi ở trong component con được bọc Suspense

    useEffect(() => {
        const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        track(EventType.VIEW_PAGE, 'page_view', { path: url });
    }, [pathname, searchParams, track]);

    return null;
};

// Provider chính
export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {children}
            {/* Bọc Suspense để cô lập logic searchParams khỏi layout chính */}
            <Suspense fallback={null}>
                <PageViewTracker />
            </Suspense>
        </>
    );
};