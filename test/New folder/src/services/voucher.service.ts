// src/services/voucher.service.ts
import { api as apiClient } from "./api";

export interface Voucher {
  id: string;
  code: string;
  name: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  amount: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  scope: 'GLOBAL' | 'SHOP' | 'PRODUCT'; 
  seller?: { shopName: string }; 
}

export interface CreateVoucherPayload {
  code: string;
  name: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  scope: 'GLOBAL' | 'SHOP'; // Frontend admin sẽ gửi GLOBAL, seller gửi SHOP
  amount: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  productIds?: string[];
}

export const VoucherService = {
  // --- SELLER ---
  getSellerVouchers: async () => {
    const { data } = await apiClient.get<Voucher[]>('/promotions/seller');
    return data;
  },

  createVoucher: async (payload: CreateVoucherPayload) => {
    // Tự động detect endpoint dựa trên scope (hoặc phân quyền login)
    // Ở đây giả định seller gọi endpoint seller
    const { data } = await apiClient.post('/promotions/seller/create', payload);
    return data;
  },

  // --- ADMIN ---
  getSystemVouchers: async () => {
    const { data } = await apiClient.get<Voucher[]>('/promotions/admin/system-vouchers');
    return data;
  },

  // 2. Lấy tất cả Voucher (Gồm cả Shop)
  getAllVouchers: async (scope?: string, search?: string) => {
    const params = new URLSearchParams();
    if (scope) params.append('scope', scope);
    if (search) params.append('search', search);
    
    const { data } = await apiClient.get<Voucher[]>(`/promotions/admin/all?${params.toString()}`);
    return data;
  },

  // 3. Admin tạo Voucher Sàn
  createSystemVoucher: async (payload: any) => {
    const { data } = await apiClient.post('/promotions/admin/create', payload);
    return data;
  },

  // --- BUYER ---
  // Lấy voucher của shop để hiển thị ở trang chi tiết sản phẩm
  getShopVouchersPublic: async (sellerId: string) => {
    // Cần 1 API public lấy voucher của shop (BE cần mở endpoint này public hoặc user login mới xem dc)
    // Tạm thời dùng endpoint seller nếu user là seller, hoặc endpoint public mới
    // Workaround: Dùng endpoint search/all của hệ thống nếu có
    return []; 
  },

  claimVoucher: async (code: string) => {
    const { data } = await apiClient.post(`/promotions/${code}/claim`);
    return data;
  },

  getMyVouchers: async () => {
    const { data } = await apiClient.get<Voucher[]>('/promotions/my-vouchers');
    return data;
  },
  getPublicSystemVouchers: async () => {
    // Gọi endpoint mới tạo ở backend
    const { data } = await apiClient.get<Voucher[]>('/promotions/public/system-vouchers');
    return data;
  },
};