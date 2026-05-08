// src/services/ContentService.ts
import { apiClient } from '@/lib/api/ApiClient';

export const SYSTEM_MENU_KEYS = {
  RECIPIENT: 'HEADER_RECIPIENT',    // Người nhận
  OCCASION: 'HEADER_OCCASION',      // Ngày lễ & Sự kiện
  BUSINESS: 'HEADER_BUSINESS',      // Quà Doanh Nghiệp
  BLOG: 'HEADER_BLOG_TOPIC'         // Blog Quà Tặng
};

// --- TYPES ---
export interface Banner {
  id: string;
  location: string;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  theme?: 'dark' | 'light';
  order: number;
  isActive: boolean;
}

// [CẬP NHẬT] Interface linh hoạt hơn cho Menu
export interface NavItem {
  name: string;
  link?: string;            // Chuyển thành Optional (để không lỗi khi code Editor)
  type?: 'custom' | 'auto'; 
  tagCode?: string;         
  
  // Các trường mới cho Auto-Tagging System
  code?: string;            // Mã định danh (VD: recipient_mom)
  keywords?: string;        // Từ khóa quét (VD: mẹ bầu, thai sản)
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface NavColumn {
  label: string;
  children: NavGroup[];
  systemType?: string; 
  systemLabel?: string;
}

export interface ContentServiceType {
  // Public
  getBanners: (location?: string) => Promise<Banner[]>;
  getConfig: (key: string) => Promise<any>;
  
  // Admin
  getAllBannersAdmin: () => Promise<Banner[]>;
  createBanner: (data: Partial<Banner>) => Promise<Banner>;
  updateBanner: (id: string, data: Partial<Banner>) => Promise<Banner>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (items: { id: string, order: number }[]) => Promise<void>;
  saveConfig: (key: string, value: any) => Promise<any>;
  getSystemTagsConfig: () => Promise<NavColumn[]>;
}

// TS-fix wiki 0031: ApiClient.request trả `T | null` (do retry/redirect 401),
// nhưng các method service-level cần unwrap về `T`. Dùng helper `unwrap` để strip null
// thành empty/throw — giữ nguyên runtime, làm chuẩn type cho consumer.
const unwrapList = <T>(v: T[] | null | undefined): T[] => v ?? [];
const unwrapVoid = (_v: any): void => undefined;
const unwrapObj = <T>(v: T | null | undefined): T => {
  if (v == null) throw new Error('ContentService: API returned null/undefined');
  return v;
};

// --- IMPLEMENTATION ---
export const ContentService: ContentServiceType = {
  // Public
  getBanners: async (location) => {
    const res = await apiClient.get<Banner[]>('/content/banners', { params: { location } });
    return unwrapList(res);
  },
  getConfig: async (key) => {
    return apiClient.get(`/content/config/${key}`);
  },

  // Admin
  getAllBannersAdmin: async () => {
    const res = await apiClient.get<Banner[]>('/content/admin/banners');
    return unwrapList(res);
  },
  createBanner: async (data) => {
    const res = await apiClient.post<Banner>('/content/admin/banners', data);
    return unwrapObj(res);
  },
  updateBanner: async (id, data) => {
    const res = await apiClient.patch<Banner>(`/content/admin/banners/${id}`, data);
    return unwrapObj(res);
  },
  deleteBanner: async (id) => {
    const res = await apiClient.delete(`/content/admin/banners/${id}`);
    return unwrapVoid(res);
  },
  reorderBanners: async (items) => {
    const res = await apiClient.patch('/content/admin/banners/reorder', { items });
    return unwrapVoid(res);
  },
  saveConfig: async (key, value) => {
    return apiClient.post('/content/admin/config', { key, value });
  },
  
  getSystemTagsConfig: async (): Promise<NavColumn[]> => {
    try {
      const [recipient, occasion, business] = await Promise.all([
        ContentService.getConfig(SYSTEM_MENU_KEYS.RECIPIENT),
        ContentService.getConfig(SYSTEM_MENU_KEYS.OCCASION),
        ContentService.getConfig(SYSTEM_MENU_KEYS.BUSINESS)
      ]);

      const formatData = (data: any[], type: string, label: string) => {
         if(!Array.isArray(data)) return [];
         return data.map(col => ({ ...col, systemType: type, systemLabel: label }));
      };

      return [
        ...formatData(recipient, 'recipient', 'Người nhận'),
        ...formatData(occasion, 'occasion', 'Ngày lễ & Sự kiện'),
        ...formatData(business, 'business', 'Quà Doanh Nghiệp'),
      ];
    } catch (error) {
      console.error("Failed to load system tags", error);
      return [];
    }
  }
};