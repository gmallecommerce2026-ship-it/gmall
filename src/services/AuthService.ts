// src/services/AuthService.ts
import { useUserStore } from '@/store/useUserStore';
import { api } from './api';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
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
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
    }
    return null;
  },

  // [MỚI] Cập nhật thông tin cá nhân
  updateProfile: async (data: UpdateProfilePayload) => {
    const res = await api.put('/users/profile', data);
    // Cập nhật lại store sau khi update thành công
    const updatedUser = res.data || res;
    useUserStore.getState().setUser(updatedUser);
    return updatedUser;
  },

  // [MỚI] Đổi mật khẩu
  changePassword: async (data: ChangePasswordPayload) => {
    return api.put('/auth/change-password', data);
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
    
    window.location.href = '/login';
  }
};