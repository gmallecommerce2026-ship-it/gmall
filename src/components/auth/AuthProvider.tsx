// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { AuthService } from "@/services/AuthService";

// Danh sách prefix cần auth. Guest visit các path này → logout (về login).
// Các path KHÔNG có prefix này (gồm cả `/`, `/product`, `/blog`, `/charity`,
// auth pages, etc.) -> guest free, không trigger logout.
//
// Trước đây dùng PUBLIC_PATHS whitelist các auth pages. Bug: trang chủ `/`
// và mọi trang public khác KHÔNG có trong list → guest visit `/` →
// AuthProvider call logout() → window.location.href='/' → reload trang `/`
// → loop vô tận. Đảo logic: chỉ logout khi vào path protected.
const PROTECTED_PREFIXES = [
  "/user",            // /user/profile, /user/address, /user/purchase, ...
  "/cart",
  "/checkout",
  "/payment",
  "/gift-payment",
  "/messages",
  "/seller-dashboard",
  "/admin",           // /admin (không bao gồm /admin/login)
];

const isProtected = (pathname: string) => {
  // /admin/login, /seller/login... là auth pages, không protected
  if (pathname.endsWith("/login") || pathname.endsWith("/register")) return false;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await AuthService.getMe();
        if (user) {
          setUser(user);
        } else if (isProtected(pathname)) {
          AuthService.logout();
        }
      } catch (error) {
        if (isProtected(pathname)) {
          AuthService.logout();
        }
        // Guest ở trang public: im lặng, không log để tránh nhiễu console
      }
    };

    if (!isAuthenticated) {
      initAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser]);

  // #48: nếu user uncheck "Ghi nhớ" lúc login, logout khi tab đóng.
  // pageHide thay cho beforeUnload (Safari/iOS firing-rate cao hơn).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPageHide = () => {
      try {
        if (sessionStorage.getItem('gmall:logout-on-close') === '1') {
          // Best-effort: clear cookie + storage. Synchronous → chạy kịp trong
          // pageHide handler (BE logout fetch không kịp commit, OK vì cookie
          // sẽ expire sau 7 ngày dù sao đi nữa).
          localStorage.removeItem('user-storage');
          localStorage.removeItem('accessToken');
          document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  return <>{children}</>;
}