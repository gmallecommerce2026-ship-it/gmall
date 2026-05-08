// src/services/api.ts
// TS-fix wiki 0031: Cast `api` thành interface trả thẳng `T` cho mỗi method,
// vì interceptor đã unwrap `res.data` nhưng TS vẫn type là `AxiosResponse`.
// Cách này giữ nguyên runtime, chỉ thay TS shape.
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
// [FIX 1] Import store để action logout clear state client
import { useUserStore } from "@/store/useUserStore";
// Fix BUG-FE-10 (wiki 0030): centralized config (throws in prod if env missing)
import { API_BASE_URL } from "@/lib/api/config";

// Type cho api: tất cả method trả thẳng <T> (data đã được unwrap bởi interceptor)
export interface UnwrappedApi extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'> {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  head: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  options: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

const _rawApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

_rawApi.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua logic logout nếu URL là check auth (tránh lặp vô tận)
    const isCheckAuthRequest = originalRequest?.url?.includes('/auth/me') || originalRequest?.url?.includes('/users/me');

    if (error.response?.status === 401 && !isCheckAuthRequest) {
        if (typeof window !== 'undefined') {
             // 1. Gọi API Logout để xóa Cookie HttpOnly
             await _rawApi.post('/auth/logout').catch(() => {});

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

export const api = _rawApi as unknown as UnwrappedApi;
