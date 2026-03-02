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
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage', 
    }
  )
);