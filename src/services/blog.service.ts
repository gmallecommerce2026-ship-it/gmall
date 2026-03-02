// src/services/blog.service.ts
import { apiClient } from '@/lib/api/ApiClient';
import { BlogPost, BlogQuery, CreateBlogDto, UpdateBlogDto, PaginatedResponse } from '@/types/blog';
import { Product } from '@/types/product';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null; 
  children?: BlogCategory[];
}

export const blogService = {
  // --- BLOGS ---
  // Lấy danh sách bài viết (có phân trang, tìm kiếm)
  getBlogs: async (params: BlogQuery) => {
    return apiClient.get('/admin/blogs', { params }) as Promise<PaginatedResponse<BlogPost>>;
  },

  // Lấy chi tiết 1 bài viết (để sửa)
  getBlogById: async (id: string) => {
    return apiClient.get(`/admin/blogs/${id}`) as Promise<BlogPost>;
  },

  // Tạo mới bài viết
  createBlog: async (data: CreateBlogDto) => {
    return apiClient.post('/admin/blogs', data) as Promise<BlogPost>;
  },

  // Cập nhật bài viết
  updateBlog: async (id: string, data: UpdateBlogDto) => {
    return apiClient.patch(`/admin/blogs/${id}`, data) as Promise<BlogPost>;
  },

  // Xóa bài viết
  deleteBlog: async (id: string) => {
    return apiClient.delete(`/admin/blogs/${id}`);
  },

  // --- CATEGORIES (NEW FEATURE) ---
  
  // Lấy danh sách danh mục
  getCategories: async () => {
    return apiClient.get('/blog-categories') as Promise<BlogCategory[]>;
  },

  // Tạo danh mục mới
  createCategory: async (data: { name: string; description?: string; parentId?: string }) => {
    return apiClient.post('/admin/blog-categories', data) as Promise<BlogCategory>;
  },

  // Cập nhật danh mục
  updateCategory: async (id: string, data: { name?: string; description?: string; parentId?: string }) => {
    return apiClient.patch(`/admin/blog-categories/${id}`, data) as Promise<BlogCategory>;
  },

  // Xóa danh mục
  deleteCategory: async (id: string) => {
    return apiClient.delete(`/admin/blog-categories/${id}`);
  },

  // --- PRODUCTS ---
  
  // Tìm kiếm sản phẩm để gắn vào bài viết
  // Endpoint: /admin/products/search-for-blog?q=...
  searchProducts: async (keyword: string) => {
    try {
      const res = await apiClient.get(`/admin/products/search-for-blog`, {
        params: { q: keyword } 
      });
      return res;
    } catch (error) {
      console.error("Search product error", error);
      return [];
    }
  },

  updateBlogOrder: async (items: { id: string; sortOrder: number }[]) => {
    return apiClient.patch('/admin/blogs/reorder/items', { items });
  },

  getPublicBlogs: async (params: BlogQuery) => {
    return apiClient.get('/blogs', { params }) as Promise<PaginatedResponse<BlogPost>>;
  },

  getPublicBlogDetail: async (idOrSlug: string) => {
    return apiClient.get(`/blogs/${idOrSlug}`) as Promise<BlogPost>;
  },

  getPublicCategoryBySlug: async (slug: string) => {
    console.log(`\n=== [DEBUG SERVICE] Bắt đầu tìm category slug: "${slug}" ===`);
    
    try {
      // 1. Gọi API lấy toàn bộ danh mục
      const allCategories = await apiClient.get('/blog-categories') as any;
      
      // LOG: Kiểm tra dữ liệu thô từ API
      console.log(`[DEBUG SERVICE] API /blog-categories trả về loại dữ liệu:`, typeof allCategories);
      console.log(`[DEBUG SERVICE] Là Array?`, Array.isArray(allCategories));
      
      let categoriesList: BlogCategory[] = [];

      // Xử lý trường hợp API trả về { data: [...] } hoặc trả về thẳng [...]
      if (Array.isArray(allCategories)) {
        categoriesList = allCategories;
        console.log(`[DEBUG SERVICE] API trả về mảng trực tiếp. Số lượng: ${categoriesList.length}`);
      } else if (allCategories && Array.isArray(allCategories.data)) {
        categoriesList = allCategories.data;
        console.log(`[DEBUG SERVICE] API trả về object { data: ... }. Số lượng: ${categoriesList.length}`);
      } else {
        console.error(`[DEBUG SERVICE] ❌ Cấu trúc API không xác định:`, JSON.stringify(allCategories, null, 2));
        return null;
      }

      // LOG: In thử 1 item đầu tiên để xem cấu trúc key (name, slug hay id?)
      if (categoriesList.length > 0) {
        console.log(`[DEBUG SERVICE] Mẫu item đầu tiên:`, JSON.stringify(categoriesList[0], null, 2));
      }

      // 2. Tìm kiếm (So sánh slug)
      const found = categoriesList.find((c: any) => c.slug === slug);

      if (found) {
        console.log(`[DEBUG SERVICE] ✅ TÌM THẤY: ID=${found.id}, Name=${found.name}`);
        return found;
      } else {
        console.warn(`[DEBUG SERVICE] ⚠️ KHÔNG TÌM THẤY slug "${slug}" trong danh sách.`);
        // In ra danh sách các slug đang có để đối chiếu
        const existingSlugs = categoriesList.map((c: any) => c.slug).join(', ');
        console.log(`[DEBUG SERVICE] Các slug hiện có trong DB: [${existingSlugs}]`);
        return null;
      }

    } catch (error) {
      console.error("[DEBUG SERVICE] ❌ Lỗi gọi API:", error);
      return null;
    }
  }
};