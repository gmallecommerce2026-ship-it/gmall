// src/services/AuthService.ts
import { useUserStore } from '@/store/useUserStore';
import { api } from './api';

// Định nghĩa kiểu dữ liệu gửi đi
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const AuthService = {
  // 1. Login
  login: async (data: LoginPayload) => {
    const response = await api.post('/auth/login', data);
    return response.data; 
  },

  register: async (data: RegisterPayload) => {
    return api.post('/auth/register', data);
  },

  async sendOtp(email: string) {
    return api.post('/auth/send-otp', { email });
  },

  // 3. Xác thực OTP -> Lưu Token chuẩn
  async verifyOtp(email: string, otp: string) {
    const res = await api.post('/auth/verify-otp', { email, otp });
    
    // API backend trả về data nằm trong res.data (nếu dùng axios standard)
    // Tuy nhiên nếu bạn đã có interceptor response trả về data trực tiếp thì giữ nguyên res
    const data = res.data || res; 

    if (data?.access_token) {
      if (typeof window !== 'undefined') {
        // [SỬA 2] Đổi 'token' thành 'accessToken' để khớp với api.ts
        localStorage.setItem('accessToken', data.access_token);
        
        // Cookie cũng đặt tên là accessToken cho đồng bộ
        document.cookie = `accessToken=${data.access_token}; path=/; max-age=86400;`; 
      }
      
      useUserStore.getState().setUser(data.user);
      return data.user;
    }
    throw new Error('Xác thực thất bại');
  },
  
  async getMe() {
    try {
      const user = await api.get('/auth/me'); // Dùng api instance
      if (user) {
        // Handle axios wrapping response.data
        const userData = user.data || user;
        useUserStore.getState().setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      // Không gọi logout ngay để tránh vòng lặp nếu lỗi mạng, chỉ logout khi 401
      // this.logout(); 
    }
    return null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      // [SỬA 3] Xóa đúng key accessToken
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; max-age=0;';
    }
    useUserStore.getState().logout();
    window.location.href = '/login';
  }
};