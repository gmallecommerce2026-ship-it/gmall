// src/services/product.service.ts
import { api } from "./api";

export const ProductService = {
  // 1. Frequently Bought Together
  getBoughtTogether: async (id: string) => {
    // [FIX] Bỏ .data vì interceptor đã xử lý
    const res = await api.get(`/store/products/${id}/bought-together`);
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
};