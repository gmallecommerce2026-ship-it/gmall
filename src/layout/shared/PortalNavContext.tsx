// src/layout/shared/PortalNavContext.tsx
'use client';

// wiki 0110 — điều hướng cho khu quản trị trên điện thoại.
//
// Trước file này: `AdminSidebar` và `SellerSidebar` đều là `hidden lg:flex`, và không có
// hamburger/drawer nào thay thế. Dưới 1024px, khu admin và kênh người bán KHÔNG có một
// đường dẫn nào — muốn sang trang khác phải gõ URL tay. Đúng cùng lớp bug với wiki 0109
// ("trang có, đường vào không có"), chỉ khác là mất đường vào theo KÍCH THƯỚC MÀN HÌNH
// chứ không theo trang.
//
// Vì sao là context chứ không phải state trong sidebar: nút mở nằm ở header của
// `layout.tsx`, còn thứ cần mở là `<aside>` — hai cây con khác nhau. Context là chỗ hẹp
// nhất để nối chúng mà không phải đôn state lên rồi khoan prop xuống nhiều tầng.
//
// Vì sao dùng chung admin + seller: hành vi giống hệt nhau (mở/đóng, khoá cuộn nền, tự
// đóng khi đổi trang, Escape). Hai bản sao sẽ lệch nhau ngay lần sửa đầu tiên.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PortalNavValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Giá trị mặc định KHÔNG throw khi thiếu Provider — có chủ đích. `AdminSidebar` được
// render trực tiếp trong test (qa-test-suite/fe/component/AdminSidebar.test.tsx) và có thể
// được dùng lại ở nơi khác; thiếu Provider thì nó phải suy biến thành sidebar desktop tĩnh,
// chứ không phải làm sập cả cây.
const PortalNavContext = createContext<PortalNavValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const usePortalNav = () => useContext(PortalNavContext);

export function PortalNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Tự đóng khi đổi trang. Mẫu drawer có sẵn của storefront
  // (components/layout/Header/MobileMenu.tsx) bắt MỖI <Link> tự gọi onClose — với sidebar
  // admin ~20 link lồng nhau thì chắc chắn sót một cái, và sót thì drawer che mất trang
  // vừa mở. Theo dõi pathname là một chỗ duy nhất, không sót được.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Khoá cuộn nền khi drawer mở, và LUÔN trả lại khi unmount — nếu không, thoát khu admin
  // trong lúc drawer đang mở sẽ để lại `overflow: hidden` trên <body> của storefront.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape đóng drawer — bàn phím ngoài trên tablet, và người dùng trợ năng.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

  return <PortalNavContext.Provider value={value}>{children}</PortalNavContext.Provider>;
}

/** Nút hamburger, chỉ hiện dưới `lg` (nơi sidebar bị ẩn). */
export function PortalNavToggle({ label = 'Mở menu điều hướng' }: { label?: string }) {
  const { isOpen, toggle } = usePortalNav();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-expanded={isOpen}
      aria-controls="portal-sidebar"
      className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
  );
}

/**
 * Nền mờ sau drawer. Chỉ tồn tại dưới `lg`; trên desktop sidebar luôn hiện nên không có
 * gì để đóng. Dùng `pointer-events-none` khi đóng thay vì gỡ khỏi DOM để tránh nhấp nháy
 * lúc transition chạy.
 */
export function PortalNavOverlay() {
  const { isOpen, close } = usePortalNav();
  return (
    <div
      onClick={close}
      aria-hidden="true"
      className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    />
  );
}

/**
 * Class cho thẻ `<aside>` của sidebar: là drawer trượt dưới `lg`, cố định từ `lg` trở lên.
 *
 * Điểm mấu chốt: MỘT cây DOM cho cả hai khổ màn hình. Cách làm ngây thơ là render sidebar
 * hai lần (bản desktop + bản mobile) — vừa gấp đôi DOM và số lần gọi API trong sidebar,
 * vừa làm test đếm link nhìn thấy hai bộ. Ở đây chỉ có `transform` đổi theo breakpoint.
 */
export const portalSidebarClass = (isOpen: boolean) =>
  [
    'fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-gray-200 shadow-sm z-50 flex flex-col',
    'transform transition-transform duration-300 ease-out lg:translate-x-0',
    isOpen ? 'translate-x-0' : '-translate-x-full',
  ].join(' ');
