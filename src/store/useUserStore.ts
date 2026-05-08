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
  setUser: (user: User | null) => void;
  updatePoint: (point: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updatePoint: (point) => set((state) => ({
        user: state.user ? { ...state.user, point } : null
      })),
      // Fix BUG-FE-1 (wiki 0030): logout phải clear cả localStorage VÀ cookie
      // accessToken. Trước đây chỉ reset state Zustand → token hợp lệ vẫn nằm
      // trên máy → tab khác / refresh vẫn auto-auth qua axios `withCredentials`.
      logout: () => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user-storage');
            // Clear cookie (chỉ xóa được non-httpOnly từ JS; httpOnly cần BE clear).
            // Path=/ phải khớp với khi set cookie để xóa thành công.
            document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
          } catch {
            // localStorage có thể fail trong incognito hoặc storage quota — không block logout
          }
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'user-storage', 
    }
  )
);