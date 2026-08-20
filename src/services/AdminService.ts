// src/services/AdminService.ts
import { apiClient } from '@/lib/api/ApiClient';
import { 
  AdminUser, 
  AdminProduct, 
  AdminShop, 
  PaginationParams, 
  PaginatedResponse, 
  AdminOrder,
  PayoutRequest,
  RevenueStats,
  AdminVoucher,
  OrderResponse,
  CreateUserDto,
  CreateFlashSaleDto
} from '@/types/admin';
import { api } from './api';



export const AdminService = {
  // ================= AUTH =================
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login/admin', { email, password });
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  // ================= DASHBOARD =================
  getDashboardStats: async () => {
    // TODO: Implement Backend: GET /admin/dashboard/stats
    return apiClient.get('/admin/dashboard/stats');
  },

  createUser: async (data: CreateUserDto) => {
    return apiClient.post('/admin/users', data);
  },

  // 2. Ban/Unban User (Cập nhật logic mới)
  toggleBanUser: async (userId: string, isBanned: boolean, reason?: string) => {
    return apiClient.patch(`/admin/users/${userId}/ban`, { isBanned, reason });
  },

  // ================= USERS & SELLERS =================
  // Lấy danh sách users (có thể lọc theo role)
  getUsers: async (params?: PaginationParams & { role?: string }) => {
    // TODO: Implement Backend: GET /admin/users
    return apiClient.get('/admin/users', { params });
  },

  // Lấy danh sách seller đang chờ duyệt (Đã có Controller)
  getPendingSellers: async (page = 1, limit = 10) => {
    return apiClient.get(`/admin/users/pending-sellers`, {
      params: { page, limit }
    });
  },

  approveSeller: async (userId: string) => {
    return apiClient.patch(`/admin/users/${userId}/approve`);
  },

  rejectSeller: async (userId: string) => {
    return apiClient.patch(`/admin/users/${userId}/reject`);
  },

  // ================= SHOPS =================
  // wiki 0110: hai hàm `getShops` / `getShopViolations` từng nằm ở đây, gọi
  // `/admin/shops` và `/admin/shops/violations`. Cả hai endpoint CHƯA BAO GIỜ tồn tại
  // trên BE (đã kiểm: không có `@Controller('admin/shops')`) — gọi vào là 404. Không nơi
  // nào còn dùng chúng: trang danh sách cửa hàng dùng thẳng `GET /shops`, còn trang "vi
  // phạm" đã được thay bằng màn Khiếu nại dựa trên `/admin/complaints` có thật. Xoá hẳn
  // thay vì để lại kèm TODO, vì một hàm sẵn-sàng-gọi trỏ vào route không tồn tại là cái
  // bẫy cho người viết màn hình tiếp theo.

  // ================= KHIẾU NẠI (wiki 0110) =================
  // BE: `AdminComplaintController` — `GET /admin/complaints`, `PATCH /admin/complaints/:id/status`.
  // Trạng thái hợp lệ do BE quy định: open | processing | resolved | rejected.
  getComplaints: async (params?: { page?: number; limit?: number; status?: string }) => {
    return apiClient.get('/admin/complaints', { params });
  },

  updateComplaintStatus: async (id: string, status: string, adminNote?: string) => {
    return apiClient.patch(`/admin/complaints/${id}/status`, { status, adminNote });
  },

  // ================= PRODUCTS =================
  // Đã có Controller: AdminProductController
  getProducts: async (params: { 
    page: number; 
    limit: number; 
    status?: string; 
    search?: string;
    categoryId?: string;
    _t?: number; // [THÊM] Cho phép truyền timestamp
}) => {
    // 1. Thiết lập giá trị mặc định
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const status = params?.status || 'ALL';
    const categoryId = params?.categoryId;
    
    // [FIX] Tạo object queryParams động để hứng toàn bộ tham số
    const queryParams: any = { 
        status, 
        page,
        limit,
        categoryId
    };

    // Nếu có search, thêm vào params gửi đi
    if (params.search) {
        queryParams.search = params.search;
    }

    // Nếu có categoryId, thêm vào params gửi đi
    if (params.categoryId) {
        queryParams.categoryId = params.categoryId;
    }

    // [THÊM] Truyền _t xuống query params để bypass cache browser/network
    if (params._t) {
        queryParams._t = params._t;
    }

    // Gọi API với object params đã đầy đủ
    const response: any = await apiClient.get('/admin/products', {
        params: queryParams
    });
    
    // 2. Xử lý trường hợp Backend trả về mảng Full (chưa phân trang server-side)
    if (Array.isArray(response)) {
        const totalItems = response.length;
        const totalPages = Math.ceil(totalItems / limit);
        
        // Logic cắt mảng (Client-side pagination simulation)
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = response.slice(startIndex, endIndex);

        return { 
            data: paginatedData, 
            meta: { 
                total: totalItems, 
                page: page, 
                limit: limit, 
                totalPages: totalPages 
            } 
        };
    }
    
    return response; 
  },

  // Duyệt/Từ chối sản phẩm (Đã có Controller)
  approveProduct: async (id: string, status: 'ACTIVE' | 'REJECTED', reason?: string) => {
    return apiClient.patch(`/admin/products/${id}/approval`, {
      status,
      reason
    });
  },

  bulkApproveProducts: async (ids: string[], status: 'ACTIVE' | 'REJECTED', reason?: string) => {
    return apiClient.patch('/admin/products/bulk-approval', {
      ids,
      status,
      reason
    });
  },
  
  getProductDetail: async (id: string) => {
      return apiClient.get(`/admin/products/${id}`);
  },

  // ================= CATEGORIES =================
  // wiki 0108: đường dẫn thật là `/categories`, KHÔNG có tiền tố `/admin`.
  // Ghi chú "TODO: Implement Backend: GET /admin/categories" ở đây là sai — backend đã
  // có sẵn `@Controller('categories')` với đủ GET/POST/PATCH/DELETE từ lâu. Vì gọi sai
  // đường dẫn nên màn Quản lý Danh mục nhận **404** và luôn rỗng, còn nút "Thêm danh mục"
  // thì bấm xong không có gì xảy ra. Đã đo trên prod: `/admin/categories` → 404,
  // `/categories` → 200.
  getAllCategories: async () => {
      return apiClient.get('/categories');
  },

  createCategory: async (data: FormData | any) => {
      return apiClient.post('/categories', data);
  },

  // ================= ORDERS =================

  getAllOrders: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return apiClient.get<PaginatedResponse<AdminOrder>>('/admin/orders', { params });
  },

  getSellersList: async (params?: any) => {
    // Gọi endpoint: GET /admin/users/sellers (Controller mới đã tạo)
    return apiClient.get('/admin/users/sellers', { params });
  },

  getSellerDetail: async (id: string) => {
    return apiClient.get(`/admin/users/sellers/${id}`);
  },

  getPendingShops: async (page = 1, limit = 10) => {
    return apiClient.get(`/admin/users/pending-shops`, {
      params: { page, limit }
    });
  },

  // [CẬP NHẬT] Khóa/Mở khóa Shop
  toggleShopBan: async (shopId: string, isBanned: boolean, reason?: string) => {
    // Gọi endpoint: PATCH /admin/users/:id/ban-status
    return apiClient.patch(`/admin/users/${shopId}/ban-status`, { isBanned, reason });
  },

  getOrderDetail: async (id: string) => {
    return apiClient.get(`/admin/orders/${id}`);
  },

  // ================= FINANCE =================
  getRevenueStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    return apiClient.get('/admin/finance/revenue', { 
      params: { period } 
    });
  },

  getPayoutRequests: async (params?: any) => {
    return apiClient.get('/admin/finance/payouts', { params });
  },

  approvePayout: async (requestId: string) => {
    return apiClient.patch(`/admin/finance/payouts/${requestId}/approve`);
  },
  
  rejectPayout: async (requestId: string, reason: string) => {
    return apiClient.patch(`/admin/finance/payouts/${requestId}/reject`, { reason });
  },

  // ================= MARKETING (VOUCHERS) =================
  getVouchers: async (params?: PaginationParams) => {
     // TODO: Implement Backend: GET /admin/marketing/vouchers
     return apiClient.get('/admin/marketing/vouchers', { params });
  },

  createVoucher: async (data: any) => {
     return apiClient.post('/admin/marketing/vouchers', data);
  },
  
  // ================= CONTENT =================
  // CMS endpoints
  // wiki 0108: đường dẫn thật là `/content/admin/banners` — controller là
  // `@Controller('content')` với route con `admin/banners`, chứ không phải
  // `/admin/content/...`. Đo trên prod: `/admin/content/banners` → 404,
  // `/content/admin/banners` → 401 (tức là route CÓ thật, chỉ đòi đăng nhập).
  getBanners: async () => {
      return apiClient.get('/content/admin/banners');
  },

  updateBanner: async (id: string, data: any) => {
      return apiClient.patch(`/content/admin/banners/${id}`, data);
  },

  // ================= BLOGS =================
  getBlogs: async (params?: any) => {
    // TODO: Implement Backend GET /admin/blogs
    return apiClient.get('/admin/blogs', { params });
  },

  createBlog: async (data: FormData) => {
     return apiClient.post('/admin/blogs', data);
  },

  updateBlog: async (id: string, data: FormData) => {
     return apiClient.patch(`/admin/blogs/${id}`, data);
  },

  deleteBlog: async (id: string) => {
     return apiClient.delete(`/admin/blogs/${id}`);
  },

  // ================= SYSTEM / SHIPPING =================
  getShippingProviders: async () => {
    // Mock data vì tính năng đang phát triển
    return [
        { id: 'ghn', name: 'Giao Hàng Nhanh', logo: '/icons/ghn.png', status: 'ACTIVE', rate: 'Standard' },
        { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', logo: '/icons/ghtk.png', status: 'ACTIVE', rate: 'Standard' },
        { id: 'shopee', name: 'SPX Express', logo: '/icons/spx.png', status: 'MAINTENANCE', rate: 'Fast' },
    ];
  },
  approveShop: async (shopId: string) => {
    return apiClient.patch(`/admin/users/${shopId}/approve`);
  },

  rejectShop: async (shopId: string, reason: string) => {
    return apiClient.patch(`/admin/users/${shopId}/reject`, { reason });
  },

  // ================= FLASH SALE =================
  getFlashSaleSessions: async (date?: string) => {
    // GET /admin/flash-sale/sessions?date=YYYY-MM-DD
    return apiClient.get('/admin/flash-sale/sessions', { 
      params: { date } 
    });
  },

  createFlashSaleSession: async (data: CreateFlashSaleDto) => {
    // POST /admin/flash-sale/sessions
    return apiClient.post('/admin/flash-sale/sessions', data);
  },

  updateFlashSaleSession: async (id: string, data: Partial<CreateFlashSaleDto>) => {
    // PATCH /admin/flash-sale/sessions/:id
    return apiClient.patch(`/admin/flash-sale/sessions/${id}`, data);
  },

  deleteFlashSaleSession: async (id: string) => {
    // DELETE /admin/flash-sale/sessions/:id
    return apiClient.delete(`/admin/flash-sale/sessions/${id}`);
  },

  // [THÊM] Lấy danh sách yêu cầu cập nhật
  getShopUpdateRequests: async (page = 1, limit = 10) => {
      return apiClient.get(`/admin/users/shop-updates`, { params: { page, limit } });
  },

  // [THÊM] Duyệt yêu cầu cập nhật
  approveShopUpdate: async (shopId: string) => {
      return apiClient.post(`/admin/users/approve-update/${shopId}`);
  },

  deleteUser: async (userId: string) => {
  return apiClient.delete(`/admin/users/${userId}`);
},
 bulkDeleteProducts: async (ids: string[]) => {
      return apiClient.delete('/admin/products/bulk/delete', {
          body: JSON.stringify({ ids }) 
      });
  },

  deleteProduct: async (id: string) => {
      return apiClient.delete(`/admin/products/${id}`);
  },

  // [wiki 0099 FIX apiClient-no-data-wrapper] apiClient (fetch) trả THẲNG body JSON,
  // KHÔNG bọc { data } như axios. BE GET /points/rate trả { rate } (point.controller.ts:53).
  // Đọc res.data ở đây luôn ra undefined -> màn hình cấu hình xu không bao giờ nhận được
  // tỷ giá thật. Đọc res?.rate và trả về number (?. vì request() trả null khi 401/body rỗng).
  getConversionRate: async (): Promise<number | undefined> => {
    const res = await apiClient.get<{ rate: number }>('/points/rate');
    return res?.rate; // BE: { rate: 10000 } -> trả về 10000
  },

  // Cập nhật tỷ lệ. BE trả { success: true, rate } (point.service.ts:109) -> trả về
  // tỷ giá server đã thực sự lưu để caller đồng bộ lại state, không tin mù input local.
  updateConversionRate: async (amount: number): Promise<number | undefined> => {
    const res = await apiClient.post<{ success: boolean; rate: number }>('/points/rate', { amount });
    return res?.rate;
  },
  deleteAllProducts: async () => {
    return await apiClient.delete('/admin/products/delete-all/cleanup');
  },

  // ===== wiki 0105 — Tiếp thị liên kết =====
  // Dùng `apiClient` (fetch) nên trả THẲNG body JSON, KHÔNG bọc `.data` như axios.
  // Đọc `res.data` ở đây là lớp bug đã xảy ra ba lần (wiki 0095/0099/0103).

  listAffiliateAccounts: async (status = 'PENDING', page = 1) =>
    apiClient.get(`/admin/affiliate/accounts?status=${encodeURIComponent(status)}&page=${page}`),

  reviewAffiliateAccount: async (
    id: string,
    body: { status: 'APPROVED' | 'REJECTED' | 'SUSPENDED'; rejectReason?: string },
  ) => apiClient.patch(`/admin/affiliate/accounts/${id}`, body),

  listAffiliateCommissions: async (status = 'ALL', page = 1) =>
    apiClient.get(`/admin/affiliate/commissions?status=${encodeURIComponent(status)}&page=${page}`),

  settleAffiliateNow: async () => apiClient.post('/admin/affiliate/settle', {}),
};
