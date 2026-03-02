// src/services/api.ts
import axios from "axios";
// [FIX 1] Import store để action logout clear state client
import { useUserStore } from "@/store/useUserStore"; 

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config;
    
    // Bỏ qua logic logout nếu URL là check auth (tránh lặp vô tận)
    const isCheckAuthRequest = originalRequest?.url?.includes('/auth/me') || originalRequest?.url?.includes('/users/me');

    if (error.response?.status === 401 && !isCheckAuthRequest) {
        if (typeof window !== 'undefined') {
             // 1. Gọi API Logout để xóa Cookie HttpOnly
             await api.post('/auth/logout').catch(() => {});
             
             // 2. Clear State Zustand (Quan trọng: để UI không còn lưu trạng thái đã login)
             useUserStore.getState().logout();

             // 3. Logic điều hướng thông minh dựa trên URL hiện tại
             const pathname = window.location.pathname;

             // Nếu đang ở trang Admin -> Về Login Admin
             if (pathname.startsWith('/admin')) {
                 if (!pathname.includes('/admin/login')) {
                     window.location.href = '/admin/login';
                 }
             } 
             // Nếu đang ở trang Seller -> Về Login Seller
             // (Check cả 2 case: đường dẫn dashboard và đường dẫn seller portal)
             else if (pathname.startsWith('/seller') || pathname.includes('/seller-dashboard')) {
                 if (!pathname.includes('/seller/login')) {
                     window.location.href = '/seller/login';
                 }
             }
             // Còn lại -> Về Login Khách hàng (Buyer)
             else {
                 if (!pathname.includes('/login') && !pathname.includes('/register')) {
                     window.location.href = '/login';
                 }
             }
        }
    }
    return Promise.reject(error);
  }
);