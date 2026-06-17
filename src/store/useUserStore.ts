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
      setUser: (user) => set({ user, isAuthenticated: !!user }),
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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user-storage');
            document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
          } catch {
            // localStorage có thể fail trong incognito hoặc storage quota — không block logout
          }
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