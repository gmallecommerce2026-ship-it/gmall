// src/services/product.service.ts
import { api } from "./api";

// wiki 0108: hình dạng này phải khớp `UpdateProductDiscountDto` của BE.
// Trước đây nó khai `variations` trong khi DTO khai `variants` — TypeScript không thể
// bắt được vì hai bên nằm ở hai repo, nên lỗi chỉ lộ ra lúc chạy: `whitelist: true`
// cắt trường lạ đi trong im lặng, API vẫn trả 200 và giảm giá phân loại biến mất.
// Ngày để `?:` vì khi TẮT giảm giá thì phải BỎ HẲN trường đi — gửi chuỗi rỗng sẽ
// rơi vào `@IsDateString()` và bị 400.
export interface DiscountPayload {
  isDiscountActive: boolean;
  discountType: 'PERCENT';
  discountValue: number;
  discountStartDate?: string;
  discountEndDate?: string;
  variants?: {
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

  /**
   * wiki 0105 — bật/tắt tiếp thị liên kết cho một sản phẩm.
   *
   * `rate` là tỉ lệ THẬP PHÂN (0.08 = 8%). Giao diện nhập theo phần trăm rồi chia 100 —
   * BE nhận thập phân và chặn ở trần `AFFILIATE_MAX_RATE`.
   */
  updateAffiliate: async (productId: string, data: { enabled: boolean; rate?: number }) => {
    const res = await api.patch(`/seller/products/${productId}/affiliate`, data);
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