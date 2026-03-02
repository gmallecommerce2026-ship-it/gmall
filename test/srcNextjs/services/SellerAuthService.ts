// src/services/SellerAuthService.ts
import { apiClient } from '@/lib/api/ApiClient';

export interface SellerLoginPayload {
  email: string;
  password: string;
}
export interface UpdateShopProfilePayload {
  shopName: string;
  pickupAddress: string;
  description?: string;
  avatar?: string;       // URL sau khi upload
  cover?: string;        // URL sau khi upload
  // Các trường giấy phép (URL)
  businessLicenseFront?: string;
  businessLicenseBack?: string;
  salesLicense?: string;
  trademarkCert?: string;
  distributorCert?: string;
}
export const SellerAuthService = {
  // Đăng nhập Seller
  login: async (data: SellerLoginPayload) => {
    // SỬA LỖI: ApiClient đã trả về dữ liệu đã parse (res.json()), 
    // nên không cần .data nữa.
    const response = await apiClient.post('/auth/login/seller', data);
    return response; 
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  // Các hàm khác (giữ nguyên logic, chỉ lưu ý bỏ header thủ công nếu có)
  registerSeller: async (data: any) => {
    return apiClient.post('/auth/register/seller', data);
  },

  checkApplicationStatus: async (email: string) => {
    return apiClient.get(`/seller/auth/application-status?email=${email}`);
  },

  getShopProfile: async () => {
    return apiClient.get('/auth/seller/profile');
  },

  updateShopProfile: async (payload: UpdateShopProfilePayload) => {
    // [SỬA ĐƯỜNG DẪN] Chuyển từ '/auth/seller/profile' thành '/shops/me/profile'
    return apiClient.put('/shops/me/profile', payload);
  },
};