// src/services/shop.service.ts
import { api } from "./api";

// Helper tạo avatar từ tên nếu không có ảnh
const getFallbackAvatar = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

export const ShopService = {
  getShopProfile: async (shopId: string) => {
    try {
      // [FIX] api.get đã trả về data, KHÔNG gọi res.data nữa
      const data: any = await api.get(`/shops/${shopId}/profile`);

      // [FIX] Map dữ liệu an toàn
      if (!data) return null;

      return {
        ...data,
        avatarUrl: data.avatarUrl || data.avatar || getFallbackAvatar(data.name || "Shop"),
        name: data.name || data.shopName || "Cửa hàng",
      };
    } catch (error) {
      console.error("Error fetching shop profile", error);
      return null;
    }
  },

  getShopVouchers: async (shopId: string) => {
    try {
      // [FIX] Trả về trực tiếp kết quả từ api
      const res = await api.get(`/shops/${shopId}/vouchers`);
      return res; 
    } catch (error) {
      return [];
    }
  }
};