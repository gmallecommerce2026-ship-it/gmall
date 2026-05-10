// src/services/AuthService.ts
import { useUserStore } from '@/store/useUserStore';
import { api } from './api';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string; // ISO date (YYYY-MM-DD)
  avatar?: string; // URL sau upload
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;      // OTP 6 số nhận qua email
  newPassword: string;
}

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
  // #48: optional flag — BE có thể đọc để adjust cookie maxAge.
  rememberMe?: boolean;
}

export const AuthService = {
  // 1. Login
  login: async (data: LoginPayload) => {
    const response = await api.post('/auth/login', data);
    return response; 
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
        const userData = user.data || user;
        useUserStore.getState().setUser(userData);
        return userData;
      }
    } catch (error: any) {
      // Wiki 0048: 401 cho /auth/me là behavior bình thường khi guest — không
      // log để tránh spam console. Chỉ log network/5xx errors thật sự.
      const status = error?.response?.status;
      if (status && status !== 401) {
        console.error("Lỗi lấy thông tin user:", error);
      }
    }
    return null;
  },

  // Cập nhật profile. Endpoint: PUT /auth/profile (B2.1, B2.4 — trước đây
  // gọi /users/profile không tồn tại -> 404 -> FE hiển thị "có lỗi").
  updateProfile: async (data: UpdateProfilePayload) => {
    const res = await api.put('/auth/profile', data);
    const updatedUser = res.data || res;
    useUserStore.getState().setUser(updatedUser);
    return updatedUser;
  },

  // Đổi mật khẩu khi đã login. BE endpoint: POST /auth/change-password
  // (xem docs/wiki/decisions/0007-password-flows.md)
  changePassword: async (data: ChangePasswordPayload) => {
    return api.post('/auth/change-password', data);
  },

  // Quên mật khẩu bước 1: gửi email nhận link + OTP reset.
  // Response message identical dù email tồn tại hay không (chống user enumeration).
  forgotPassword: async (data: ForgotPasswordPayload) => {
    return api.post('/auth/forgot-password', data);
  },

  // Quên mật khẩu bước 2: nhập OTP + mật khẩu mới.
  resetPassword: async (data: ResetPasswordPayload) => {
    return api.post('/auth/reset-password', data);
  },

  // [MỚI] Upload Avatar (Giả định bạn có endpoint upload)
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  logout: async () => {
    try {
        await api.post('/auth/logout');
    } catch (e) {
        console.error(e);
    }

    useUserStore.getState().logout();

    // B2.5: redirect về trang chủ thay vì /login — sau logout user muốn thấy
    // trang chủ (có thể tiếp tục xem SP), không phải ép login lại ngay.
    window.location.href = '/';
  }
};