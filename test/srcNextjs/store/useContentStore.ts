import { create } from 'zustand';
import { ContentService } from '@/services/ContentService';

interface ContentState {
  banners: Record<string, any[]>;
  menus: Record<string, any>; // Chứa: CATEGORIES, RECIPIENT, OCCASION, BUSINESS, FOOTER
  isLoading: boolean;
  
  fetchBanners: (location: string) => Promise<void>;
  fetchConfig: (key: string) => Promise<void>;
  fetchAllGlobalContent: () => Promise<void>;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  banners: {},
  menus: {},
  isLoading: false,

  fetchBanners: async (location) => {
    if (get().banners[location]) return;
    try {
      const data: any = await ContentService.getBanners(location);
      set((state) => ({ banners: { ...state.banners, [location]: data } }));
    } catch (error) { console.error(`Error loading banners ${location}`, error); }
  },

  fetchConfig: async (key) => {
    if (get().menus[key]) return;
    try {
      const data = await ContentService.getConfig(key);
      set((state) => ({ menus: { ...state.menus, [key]: data || [] } }));
    } catch (error) { console.error(`Error loading config ${key}`, error); }
  },

  fetchAllGlobalContent: async () => {
    set({ isLoading: true });
    // Tải song song tất cả cấu hình cần thiết
    await Promise.all([
      get().fetchConfig('HEADER_CATEGORIES'), // Mega Menu chính
      get().fetchConfig('HEADER_RECIPIENT'),  // Menu Người nhận
      get().fetchConfig('HEADER_OCCASION'),   // Menu Ngày lễ/Nhân dịp
      get().fetchConfig('HEADER_BUSINESS'),   // Menu Doanh nghiệp
      get().fetchConfig('FOOTER_DATA'),       // Footer
      get().fetchBanners('HERO_MAIN'),
      get().fetchBanners('HERO_SUB'),
    ]);
    set({ isLoading: false });
  },
  activeDropdown: null,
  setActiveDropdown: (key) => set({ activeDropdown: key }),
}));