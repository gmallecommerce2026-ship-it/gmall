// src/services/category.service.ts
import { apiClient } from '@/lib/api/ApiClient'; // Giả sử bạn dùng axios instance này

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTreeItem[]; // Mảng con đệ quy
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  hasChildren: boolean;
  path?: string; // Dùng cho search result
}

export const CategoryService = {
  // Lấy danh sách theo parentId.
  // wiki 0103: BE `GET /categories` trả MẢNG THẲNG, và `apiClient` (fetch) trả nguyên
  // body chứ không bọc `{data}` như axios → `response.data` luôn `undefined`. Hai hàm
  // này hiện chưa nơi nào gọi nên chưa ai thấy hậu quả; sửa để nếu sau này dùng tới
  // thì không dính bẫy. (`?? []` giữ đúng kiểu trả về khi 401 → `request()` trả `null`.)
  getById: async (parentId?: string): Promise<Category[]> => {
    const params = parentId ? { parentId } : {};
    const response = await apiClient.get<Category[]>('/categories', { params });
    return Array.isArray(response) ? response : [];
  },

  // Tìm kiếm danh mục — BE `GET /categories/search` cũng trả mảng thẳng.
  search: async (keyword: string): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/search', {
      params: { q: keyword },
    });
    return Array.isArray(response) ? response : [];
  },
  getBySlug: async (slug: string): Promise<any> => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return Array.isArray(response) ? response : (response?.data || response);
  },
  // Lấy full tree (breadcrumbs) bằng ID danh mục lá (dùng cho edit product hoặc SEO)
  getBreadcrumbs: async (leafId: string): Promise<Category[]> => {
    console.log(`[CategoryService] Đang gọi API lấy breadcrumb cho ID:`, leafId);

    try {
      const response = await apiClient.get(`/categories/${leafId}/breadcrumbs`);

      console.log(`[CategoryService] API Response Raw:`, response);

      // Xử lý linh hoạt cả 2 trường hợp response bọc data hoặc không
      // Nhiều axios interceptor sẽ trả về data trực tiếp, số khác trả về object { data: ... }
      const data = Array.isArray(response) ? response : (response?.data || []);

      console.log(`[CategoryService] Dữ liệu sau khi xử lý:`, data);
      return data;
    } catch (error) {
      console.error(`[CategoryService] Lỗi khi gọi API:`, error);
      return [];
    }
  },

  getTree: async (): Promise<CategoryTreeItem[]> => {
    const response = await apiClient.get('/categories/tree');

    // [QUAN TRỌNG] Kiểm tra cấu trúc response của ApiClient
    // Nếu ApiClient trả về mảng trực tiếp -> dùng response
    if (Array.isArray(response)) return response;

    // Nếu trả về object { data: [...] } -> dùng response.data
    return response?.data || [];
  },
  updateOrder: async (parentId: string | null, orderedIds: string[]) => {
    return apiClient.post('/categories/update-order', {
      parentId,
      orderedIds,
    });
  },
  flattenTreeIds: (node: CategoryTreeItem): string[] => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids = [...ids, ...CategoryService.flattenTreeIds(child)];
      });
    }
    return ids;
  }
};