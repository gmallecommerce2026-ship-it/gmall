// src/services/shop.service.ts
import { api } from "./api";

// Helper tạo avatar từ tên nếu không có ảnh
const getFallbackAvatar = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

export const ShopService = {
  getShopProfile: async (shopId: string) => {
    try {
      const res = await api.get(`/shops/${shopId}/profile`);
      const data = res.data;

      // [FIX] Map dữ liệu an toàn để tránh null
      return {
        ...data,
        // Ưu tiên avatar từ DB -> nếu null thì dùng UI Avatars
        avatarUrl: data.avatarUrl || data.avatar || getFallbackAvatar(data.name || "Shop"),
        // Map thêm các trường nếu backend trả về tên khác
        name: data.name || data.shopName || "Cửa hàng",
      };
    } catch (error) {
      console.error("Error fetching shop profile", error);
      return null;
    }
  },

  getShopVouchers: async (shopId: string) => {
    try {
      const res = await api.get(`/shops/${shopId}/vouchers`);
      return res.data;
    } catch (error) {
      return [];
    }
  }
};