// src/components/layout/Header/NavOverlay.tsx
'use client';
import { useContentStore } from '@/store/useContentStore';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function NavOverlay() {
  const { activeDropdown } = useContentStore();
  const [mounted, setMounted] = useState(false);

  // hooks-fix wiki 0031: hydration mount flag — legitimate setState in effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // --- LOGIC CHẶN CUỘN (SCROLL LOCK) ---
  useEffect(() => {
    if (!activeDropdown) return; // Nếu không mở menu thì không làm gì cả

    const preventScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Kiểm tra: Nếu chuột đang lăn bên trong vùng nội dung của Menu -> Cho phép cuộn
      // (Do đã có overscroll-behavior: contain ở bước 1 nên nó sẽ an toàn)
      if (target.closest('.nav-dropdown-scrollable')) {
         return;
      }

      // Trường hợp còn lại (lăn ở Overlay đen, Header, hoặc vùng trắng) -> Chặn hoàn toàn
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // passive: false là BẮT BUỘC để dùng được e.preventDefault()
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    // Cleanup khi đóng menu
    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [activeDropdown]);

  if (!mounted) return null;

  return createPortal(
    <div 
      className={`
        fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out
        ${activeDropdown ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `}
      style={{ zIndex: 40 }} 
    />,
    document.body
  );
}