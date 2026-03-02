// src/services/SellerAuthService.ts
import { apiClient } from '@/lib/api/ApiClient';

export interface SellerLoginPayload {
  email: string;
  password: string;
}

export const SellerAuthService = {
  // Đăng nhập Seller
  login: async (data: SellerLoginPayload) => {
    // SỬA LỖI: ApiClient đã trả về dữ liệu đã parse (res.json()), 
    // nên không cần .data nữa.
    const response = await apiClient.post('/auth/login/seller', data);
    return response; 
  },

  // Các hàm khác (giữ nguyên logic, chỉ lưu ý bỏ header thủ công nếu có)
  registerSeller: async (formData: FormData) => {
    return apiClient.post('/auth/register/seller', formData);
  },

  checkApplicationStatus: async (email: string) => {
    return apiClient.get(`/seller/auth/application-status?email=${email}`);
  },

  updateShopProfile: async (formData: FormData) => {
    // Nhắc lại: Không truyền header Content-Type thủ công
    return apiClient.put('/auth/seller/profile', formData);
  },

  getShopProfile: async () => {
    return apiClient.get('/auth/seller/profile');
  }
};