// src/services/shop.service.ts
import { apiClient } from "@/lib/api/ApiClient";
import { api } from "./api";




// Helper tạo avatar từ tên nếu không có ảnh
const getFallbackAvatar = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;


export interface ShopCategory {
    id: string;
    name: string;
    isActive: boolean;
    _count?: { products: number };
}

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

  // wiki 0108: danh sách gian hàng công khai cho trang `/shop`.
  // BE `GET /shops` trả `{ data: [{id,name,avatar,slug}], meta: {total,page,limit,totalPages} }`
  // và ĐÃ lọc `status: 'ACTIVE'` phía server, nên FE không phải lọc lại.
  getShops: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const res: any = await api.get('/shops', { params });
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      return {
        shops: (Array.isArray(list) ? list : []).map((s: any) => ({
          id: s.id,
          slug: s.slug,
          name: s.name || 'Cửa hàng',
          avatarUrl: s.avatarUrl || s.avatar || getFallbackAvatar(s.name || 'Shop'),
          productCount: s.productCount ?? s._count?.products ?? null,
          rating: s.rating ?? null,
        })),
        total: res?.meta?.total ?? 0,
        totalPages: res?.meta?.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching shops', error);
      return { shops: [], total: 0, totalPages: 1 };
    }
  },

  getMyShop: async () => {
    return apiClient.get('/shops/me');
  },

  getSellerDashboardStats: async () => {
    return apiClient.get('/admin/dashboard/seller/stats');
  },

  getShopVouchers: async (shopId: string) => {
    try {
      // [FIX] Trả về trực tiếp kết quả từ api
      const res = await api.get(`/shops/${shopId}/vouchers`);
      return res; 
    } catch (error) {
      return [];
    }
  },
  getSellerCategories: async () => {
    return api.get<ShopCategory[]>('/seller/shop-categories');
  },

  createCategory: async (name: string) => {
    return api.post('/seller/shop-categories', { name });
  },

  updateCategory: async (id: string, data: { name?: string, isActive?: boolean }) => {
    return api.put(`/seller/shop-categories/${id}`, data);
  },

  deleteCategory: async (id: string) => {
    return api.delete(`/seller/shop-categories/${id}`);
  },

  addProductsToCategory: async (categoryId: string, productIds: string[]) => {
    return api.post(`/seller/shop-categories/${categoryId}/products`, { productIds });
  },

  getPublicShopCategories: async (shopId: string) => {
    return api.get(`/shops/${shopId}/custom-categories`);
  },
  
  // API lấy danh sách sản phẩm để thêm vào danh mục (đã có nhưng cần tối ưu params nếu cần)
  getSellerProducts: async (params: any) => {
    return api.get('/seller/products', { params });
  },

  getShopCategories: async (shopId: string) => {
    return api.get<ShopCategory[]>(`/shops/${shopId}/custom-categories`);
  },

  // Ensure params are passed correctly to handle shopCategoryId
  getShopProducts: async (shopId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    shopCategoryId?: string; // Add this specific param
    rating?: number;
    keyword?: string;
  }) => {
    return api.get(`/shops/${shopId}/products`, { params });
  },

  getShopCustomCategories: async (shopId: string) => {
    const response = await api.get(`/shops/${shopId}/custom-categories`);
    return response;
  },

  getReviews: async (shopId: string, params: { page?: number }) => {
      return api.get(`/shops/${shopId}/reviews`, { params });
  },
};