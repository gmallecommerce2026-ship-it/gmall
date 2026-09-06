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
  /** wiki 0095 B6: mã giới thiệu từ link affiliate `/register?ref=<id>`. */
  ref?: string;
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
    
    // [FIX wiki 0095/0099/0103] `api` (axios) đã unwrap `res.data` ở interceptor nên `res`
    // CHÍNH LÀ body — nhánh `.data` là dự phòng, và phải có `?.` vì body có thể là `null`
    // (BE trả JSON `null`) hoặc rỗng → `res.data` ném TypeError trước cả khi gate `data?.user`
    // kịp chạy. Giữ nguyên `||` để không đổi thứ tự ưu tiên cũ.
    const data = res?.data || res;

    // [round15 FIX verifyotp-gate] BE giờ set httpOnly cookie + trả { user } (KHÔNG còn access_token).
    // Gate PHẢI dựa vào `user` — nếu vẫn check access_token sẽ throw "Xác thực thất bại" trên verify
    // THÀNH CÔNG (OTP đã bị tiêu) → user kẹt vĩnh viễn không đăng ký được. Không persist raw token
    // JS-readable nữa; auth chạy hoàn toàn bằng httpOnly cookie (api.ts withCredentials) do BE set.
    if (data?.user) {
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
    // [FIX wiki 0095/0099/0103] Cùng lý do: interceptor axios đã unwrap nên `res` là body;
    // `.data` chỉ là dự phòng và cần `?.` vì body có thể `null`/rỗng → tránh TypeError.
    const updatedUser = res?.data || res;
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