// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  point: number;
  avatar?: string;
  isVerified?: boolean;
  
  // Các trường bổ sung cho Seller
  shopName?: string;       
  pickupAddress?: string;  
  description?: string;    
  coverImage?: string;     
  businessLicenseFront?: string;
  businessLicenseBack?: string,
  salesLicense: string,
  trademarkCert: string,
  distributorCert: string
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  // Cờ rehydrate xong: pages dùng auth guard có thể dựa vào đây thay vì check
  // `isAuthenticated` ngay first render (lúc đó persist chưa load → false dù
  // user đã login → redirect /login sai). Set true sau khi `onRehydrateStorage`.
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  updatePoint: (point: number) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      // [round15 FIX point-alias] /auth/me & /auth/login trả `points` (số nhiều, khớp
      // cột schema) nhưng FE interface dùng `point` (số ít) → setUser raw object để
      // user.point = undefined → maxCoins=0 → block "Dùng G-Mall Xu" bị ẩn tới khi
      // TopBar /points/me backfill. Normalize ngay tại store boundary.
      setUser: (user) =>
        set({
          user: user
            ? { ...user, point: (user as any).point ?? (user as any).points ?? 0 }
            : null,
          isAuthenticated: !!user,
        }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updatePoint: (point) => set((state) => ({
        user: state.user ? { ...state.user, point } : null
      })),
      // Fix BUG-FE-1 (wiki 0030): logout phải clear cả localStorage VÀ cookie
      // accessToken. Trước đây chỉ reset state Zustand → token hợp lệ vẫn nằm
      // trên máy → tab khác / refresh vẫn auto-auth qua axios `withCredentials`.
      // R3-6 (wiki 0045): nếu đang ở route protected, redirect về home để
      // tránh stuck ở `/user/profile` hiển thị data stale của user vừa logout.
      logout: () => {
        let needsRedirect = false;
        if (typeof window !== 'undefined') {
          // [FIX logout] Cookie accessToken là httpOnly → JS KHÔNG thể xoá bằng document.cookie.
          // PHẢI gọi BE /auth/logout để server xoá cookie (Set-Cookie hết hạn). Trước đây store.logout
          // chỉ xoá state + thử document.cookie (vô hiệu với httpOnly) + KHÔNG gọi BE → cookie còn
          // nguyên → refresh vẫn đăng nhập. keepalive=true để request sống sót khi trang điều hướng.
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            fetch(`${apiUrl}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
              keepalive: true,
            }).catch(() => {});
          } catch {
            // không chặn logout nếu fetch lỗi
          }
          try {
            // [round15 FIX no-js-token] App KHÔNG còn GHI raw token vào JS-readable storage (httpOnly
            // cookie do BE quản lý qua /auth/logout ở trên). Vẫn DỌN defensively token legacy nếu còn
            // sót (lần cài cũ) — removeItem/clear non-httpOnly cookie là vô hại + dọn sạch.
            localStorage.removeItem('accessToken');
            document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
            localStorage.removeItem('user-storage');
            // [round15 FIX clear-cart] Cũng xoá cart-storage để máy dùng chung không lộ giỏ hàng
            // user cũ sang user mới (Header badge / MiniCart đọc trực tiếp store đã persist).
            localStorage.removeItem('cart-storage');
            localStorage.removeItem('gmall-checkout-storage');
          } catch {
            // localStorage có thể fail trong incognito hoặc storage quota — không block logout
          }
          // [round15 FIX clear-cart] Reset cart store in-memory (badge/MiniCart render từ state này,
          // không chỉ từ localStorage). Lazy import tránh circular dependency.
          try {
            import('./useCartStore')
              .then((m) => m.useCartStore.getState().clearCart())
              .catch(() => {});
          } catch { /* ignore */ }
          // [round15 FIX clear-chat] Logout phải tear down socket chat + xoá state in-memory,
          // nếu không socket cũ vẫn nhận tin nhắn riêng tư của user cũ realtime và widget
          // vẫn hiển thị hội thoại/lịch sử cũ. Lazy import tránh circular dependency.
          try {
            import('./useChatStore')
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
          } catch { /* ignore */ }
          const path = window.location.pathname;
          const PROTECTED = ['/user', '/cart', '/checkout', '/payment', '/gift-payment', '/messages', '/seller-dashboard', '/admin'];
          needsRedirect = PROTECTED.some(p => path.startsWith(p)) && !path.endsWith('/login');
        }
        set({ user: null, isAuthenticated: false });
        if (needsRedirect) {
          // assign (không replace) để user có thể back lại nếu cần
          window.location.assign('/');
        }
      },
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);