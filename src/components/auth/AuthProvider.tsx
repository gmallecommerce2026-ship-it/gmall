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

  // wiki 0108: KHÔNG dùng `AuthService.logout()` cho tình huống "khách lạc vào trang cần
  // đăng nhập". Hàm đó là cho việc người dùng CHỦ ĐỘNG bấm Đăng xuất — nó kết thúc bằng
  // `window.location.href = '/'`, hợp lý khi tự thoát nhưng sai ở đây: khách bị bỏ giữa
  // trang chủ, không được mời đăng nhập, và mất luôn chỗ định vào. Đo trên prod: `/cart`,
  // `/user/profile`, `/user/invite`, `/user/password`, `/user/help` đều rơi về `/`.
  // Ở đây chỉ cần đưa họ tới trang đăng nhập kèm đường về.
  const bounceToLogin = () => {
    if (typeof window === 'undefined') return;
    const back = window.location.pathname + window.location.search;
    if (window.location.pathname.startsWith('/admin')) {
      window.location.assign(`/admin/login?next=${encodeURIComponent(back)}`);
    } else if (window.location.pathname.startsWith('/seller-dashboard')) {
      window.location.assign(`/seller/login?next=${encodeURIComponent(back)}`);
    } else {
      window.location.assign(`/login?next=${encodeURIComponent(back)}`);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await AuthService.getMe();
        if (user) {
          setUser(user);
        } else if (isProtected(pathname)) {
          bounceToLogin();
        }
      } catch (error) {
        if (isProtected(pathname)) {
          bounceToLogin();
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
          // [round15 FIX remember-me-off] Cookie session là httpOnly → JS KHÔNG xoá được bằng
          // document.cookie (line cũ là no-op rác, đã bỏ). PHẢI gọi BE /auth/logout để server
          // xoá cookie. Dùng sendBeacon (sống sót qua unload) + fallback keepalive fetch.
          // Lưu ý: đây vẫn là best-effort; fix triệt để cần BE phát hành SESSION cookie
          // (omit maxAge) khi rememberMe=false — ngoài phạm vi file này.
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          let beaconSent = false;
          if (navigator.sendBeacon) {
            beaconSent = navigator.sendBeacon(`${apiUrl}/auth/logout`);
          }
          if (!beaconSent) {
            fetch(`${apiUrl}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
              keepalive: true,
            }).catch(() => {});
          }
          localStorage.removeItem('user-storage');
          // [round15 L2 FIX] remember-me-off ⇒ máy dùng chung: cũng xoá cart-storage +
          // gmall-checkout-storage để giỏ hàng user cũ không persist sang người dùng kế
          // tiếp (mirror useUserStore.logout()). removeItem đồng bộ → an toàn trong pagehide.
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('gmall-checkout-storage');
          // [round15 L2 FIX] Tear down chat socket + xoá state in-memory để socket cũ
          // không nhận tin nhắn riêng tư realtime trên máy dùng chung. Lazy import tránh
          // circular dependency; best-effort (pagehide có thể chấm dứt trước khi resolve).
          import('@/store/useChatStore')
            .then((m) => {
              const s = m.useChatStore.getState();
              s.disconnectSocket();
              s.clearMessages();
              m.useChatStore.setState({
                conversations: [],
                activeConversationId: null,
                isOpen: false,
              });
            })
            .catch(() => {});
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  return <>{children}</>;
}