// src/services/AdminService.ts (Tạo mới hoặc sửa)
import { apiClient } from '@/lib/api/ApiClient';

export const AdminService = {
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login/admin', { email, password });
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  // 2. Lấy danh sách sản phẩm (Quyền Admin)
  // Backend cũ: GET /products (trộn lẫn)
  // Backend mới: GET /admin/products (nhìn thấy cả hàng ẩn/xóa)
  getAllProducts: async (params?: any) => {
    return apiClient.get('/admin/products', { params });
  },

  // 3. Duyệt/Khóa sản phẩm
//   approveProduct: async (id: string) => {
//     return apiClient.patch(`/admin/products/${id}/approve`);
//   },
  getPendingSellers: async (page = 1, limit = 10) => {
    return apiClient.get(`/admin/users/pending-sellers?page=${page}&limit=${limit}`);
  },

  approveSeller: async (userId: string) => {
    return apiClient.patch(`/admin/users/${userId}/approve`);
  },

  rejectSeller: async (userId: string) => {
    return apiClient.patch(`/admin/users/${userId}/reject`);
  },

  getProducts: async (status: string = 'ALL') => {
    const response = await apiClient.get('/admin/products', {
      params: { status }
    });
    
    if (Array.isArray(response)) {
        return response;
    }
    
    return response.data;
  },

  approveProduct: async (id: string, status: 'ACTIVE' | 'REJECTED', reason?: string) => {
    const response = await apiClient.patch(`/admin/products/${id}/approval`, {
      status,
      reason
    });
    return response.data || response;
  }
};