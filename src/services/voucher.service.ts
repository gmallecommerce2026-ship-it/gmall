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
  discountValue?: number; // Alias cho amount để tránh lỗi UI
  discountType?: 'FIXED_AMOUNT' | 'PERCENTAGE'; // Alias cho type
  minOrder?: number; // Alias cho minOrderValue
}

export interface CreateVoucherPayload {
  code: string;
  name: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  scope: 'GLOBAL' | 'SHOP' | 'PRODUCT' | 'CATEGORY';
  amount: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  productIds?: string[];
  categoryIds?: string[];
}

export const VoucherService = {
  // --- SELLER ---
  getSellerVouchers: async () => {
    // [FIX] Ép kiểu về any[] vì interceptor đã trả về data
    const res = await apiClient.get<any[]>('/promotions/seller');
    return res as unknown as any[];
  },

  createVoucher: async (payload: CreateVoucherPayload) => {
    const res = await apiClient.post('/promotions/seller/create', payload);
    return res;
  },

  // --- ADMIN ---
  getSystemVouchers: async () => {
    const res = await apiClient.get<any[]>('/promotions/admin/system-vouchers');
    return res;
  },

  // 2. Lấy tất cả Voucher
  getAllVouchers: async (scope?: string, search?: string) => {
    const params = new URLSearchParams();
    if (scope) params.append('scope', scope);
    if (search) params.append('search', search);
    
    const res = await apiClient.get<any[]>(`/promotions/admin/all?${params.toString()}`);
    return res;
  },

  // 3. Admin tạo Voucher Sàn
  createSystemVoucher: async (payload: any) => {
    const res = await apiClient.post('/promotions/admin/create', payload);
    return res;
  },

  // --- BUYER ---
  getShopVouchersPublic: async (sellerId: string) => {
    return []; 
  },

  claimVoucher: async (code: string) => {
    const res = await apiClient.post(`/promotions/${code}/claim`);
    return res;
  },

  getMyVouchers: async () => {
    const res = await apiClient.get<Voucher[]>('/promotions/my-vouchers');
    return res as unknown as Voucher[];
  },

  getPublicSystemVouchers: async () => {
    const res = await apiClient.get<any[]>('/promotions/public/system-vouchers');
    return res as unknown as any[];
  },
};