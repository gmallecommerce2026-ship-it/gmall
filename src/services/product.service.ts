// src/services/product.service.ts
import { api } from "./api";

export interface DiscountPayload {
  isDiscountActive: boolean;
  discountType: 'PERCENT';
  discountValue: number;
  discountStartDate: string;
  discountEndDate: string;
  variations?: {
    id: string; // Variant ID hoặc SKU ID
    discountValue: number;
  }[];
}

export const ProductService = {
  // 1. Frequently Bought Together
  getBoughtTogether: async (id: string) => {
    // [FIX] Bỏ .data vì interceptor đã xử lý
    const res = await api.get(`/store/products/${id}/bought-together`);
    return res; 
  },

  updateDiscount: async (productId: string, data: DiscountPayload) => {
    const res = await api.patch(`/seller/products/${productId}/discount`, data);
    return res;
  },
  
  // 2. More from this Shop
  getMoreFromShop: async (id: string) => {
    // [FIX] Bỏ .data
    const res = await api.get(`/store/products/${id}/more-from-shop`);
    return res;
  },

  // 3. You May Also Like (Related)
  getRelated: async (id: string) => {
    // [FIX] Bỏ .data
    const res = await api.get(`/store/products/${id}/related`);
    return res;
  },

  getReviews: async (productId: string, params: { page?: number; rating?: number }) => {
    return api.get(`/store/products/${productId}/reviews`, { params });
  },
};