// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatar?: string;
  isVerified?: boolean;
  
  // Các trường bổ sung cho Seller
  shopName?: string;       
  pickupAddress?: string;  
  description?: string;    
  coverImage?: string;     
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage', 
    }
  )
);