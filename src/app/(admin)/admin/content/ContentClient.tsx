'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash, FiImage, FiMenu, FiLayout, FiGift, FiCalendar, FiBriefcase, FiEdit2, FiX } from 'react-icons/fi';
import classNames from 'classnames';
import { ContentService, SYSTEM_MENU_KEYS, Banner } from '@/services/ContentService';
import { toast } from 'react-hot-toast';
import { uploadFileToR2 } from '@/services/uploadService';

// Import các component
import CategoryTreeManager from '@/components/admin/content/CategoryTreeManager';
import MenuConfigEditor from '@/components/admin/content/MenuConfigEditor';
import FooterConfigEditor from '@/components/admin/content/FooterConfigEditor';

// --- ĐỊNH NGHĨA TABS (Dùng constant từ Service để tránh lỗi Typo) ---
const TABS = [
  {
    id: 'banners',
    label: 'Banner Quảng Cáo',
    icon: <FiImage />,
    key: null,
    type: 'banner'
  },
  {
    id: 'recipient',
    label: 'Menu Người Nhận',
    icon: <FiGift />,
    key: SYSTEM_MENU_KEYS.RECIPIENT, // Thay cho 'HEADER_RECIPIENT'
    type: 'menu'
  },
  {
    id: 'occasion',
    label: 'Menu Ngày Lễ',
    icon: <FiCalendar />,
    key: SYSTEM_MENU_KEYS.OCCASION,  // Thay cho 'HEADER_OCCASION' -> Đảm bảo khớp 100%
    type: 'menu'
  },
  {
    id: 'business',
    label: 'Quà Doanh Nghiệp',
    icon: <FiBriefcase />,
    key: SYSTEM_MENU_KEYS.BUSINESS,  // Thay cho 'HEADER_BUSINESS'
    type: 'menu'
  },
  {
    id: 'footer',
    label: 'Footer Links',
    icon: <FiLayout />,
    key: 'FOOTER_DATA',
    type: 'footer'
  },
];
export const BANNER_LOCATION_MAP: Record<string, string> = {
  HOMEPAGE: 'Trang chủ — banner chính',
  HERO_SUB: 'Banner phụ trang chủ',
  PRODUCT_DETAIL: 'Trang chi tiết sản phẩm',
  CATEGORY: 'Trang danh mục',
};
export default function ContentClient() {
  const [activeTabId, setActiveTabId] = useState('banners');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  // #61 — modal banner editor
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  const currentTab = TABS.find(t => t.id === activeTabId);
  const currentTabKey = currentTab?.key;
  const currentTabType = currentTab?.type;

  // --- API HANDLERS ---
  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await ContentService.getAllBannersAdmin();
      setBanners(res || []);
    } catch (e) {
      toast.error('Không thể tải danh sách banner');
    } finally { setLoading(false); }
  }, []);

  // hooks-fix wiki 0031: useCallback so effect dep is stable + read tab type via captured arg
  const loadConfig = useCallback(async (key: string, fallbackType?: string) => {
    setLoading(true);
    try {
      const res = await ContentService.getConfig(key);
      setConfigData(res);
    } catch (e) {
      console.error(`Lỗi tải config cho key: ${key}`, e);
      // Fallback: Menu thì trả mảng rỗng, Footer trả object rỗng
      setConfigData(fallbackType === 'footer' ? {} : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // Reset data để tránh lọt data của tab cũ sang tab mới khi đang loading
    setConfigData(null);

    if (currentTabType === 'banner') {
      loadBanners();
    } else if (currentTabKey && currentTabType !== 'tree') {
      loadConfig(currentTabKey, currentTabType);
    }
  }, [currentTabKey, currentTabType, loadBanners, loadConfig]);

  const handleSaveConfig = async (data: any) => {
    // Sử dụng currentTab từ closure có thể rủi ro nếu component re-render nhanh, 
    // nhưng ở đây ta lấy key từ activeTabId hiện tại để an toàn hơn.
    const targetKey = currentTab?.key;

    if (!targetKey) {
      toast.error('Không xác định được Key cấu hình!');
      return;
    }

    setLoading(true);
    try {
      console.log(`Đang lưu config cho key: ${targetKey}`, data); // Log để debug
      await ContentService.saveConfig(targetKey, data);

      toast.success(`Đã lưu ${currentTab?.label}!`);
      setConfigData(data);
    } catch (error: any) {
      console.error("Lỗi lưu config:", error);
      // Hiển thị lỗi chi tiết từ Backend nếu có
      const msg = error?.response?.data?.message || error?.message || 'Lỗi server';
      toast.error(`Lỗi khi lưu: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER BANNERS ---
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa banner này không?')) return;
    try {
      await ContentService.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Đã xóa banner');
    } catch (error) { toast.error('Lỗi khi xóa banner'); }
  };

  const renderBannerList = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
      <button type="button"
        className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-orange-500 hover:text-orange-500 transition-colors bg-gray-50 hover:bg-white"
        onClick={() => setEditingBanner({ location: 'HOMEPAGE', isActive: true, order: banners.length })}>
        <FiPlus size={32} />
        <span className="mt-2 text-sm font-medium">Thêm Banner Mới</span>
      </button>
      {banners.map(b => (
        <div key={b.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group relative hover:shadow-md transition-shadow">
          <div className="h-32 bg-gray-100 relative">
            <img
              src={b.src}
              className="h-full w-full object-cover"
              alt={b.title}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'; }}
            />
          </div>
          <div className="p-3">
            <p className="font-bold text-sm truncate text-gray-800">{b.title || 'No Title'}</p>
            {b.ctaLabel && (
              <p className="text-[11px] text-gray-500 truncate mt-0.5">CTA: <b>{b.ctaLabel}</b> → {b.ctaLink || '—'}</p>
            )}
            <div className="mt-1 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-800 bg-gray-200 px-2 py-0.5 rounded font-medium w-fit">
                  {BANNER_LOCATION_MAP[b.location] || b.location}
                </span>
                <span className="text-[10px] text-gray-400">({b.location})</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {b.isActive ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => setEditingBanner(b)}
              className="p-2 bg-white rounded-full text-blue-600 shadow-sm hover:bg-blue-50"
              title="Sửa banner">
              <FiEdit2 />
            </button>
            <button onClick={() => handleDeleteBanner(b.id)}
              className="p-2 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50"
              title="Xóa banner">
              <FiTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const handleSaveBanner = async (form: Partial<Banner>, file?: File | null) => {
    setLoading(true);
    try {
      let src = form.src;
      if (file) {
        src = await uploadFileToR2(file);
      }
      if (!src) {
        toast.error('Vui lòng chọn ảnh banner');
        return;
      }
      const payload: Partial<Banner> = {
        location: form.location || 'HOMEPAGE',
        src,
        title: form.title || '',
        description: form.description || '',
        ctaLabel: form.ctaLabel || '',
        ctaLink: form.ctaLink || '',
        order: typeof form.order === 'number' ? form.order : 0,
        isActive: form.isActive !== false,
      };
      if (form.id) {
        const updated = await ContentService.updateBanner(form.id, payload);
        setBanners((prev) => prev.map((x) => (x.id === form.id ? updated : x)));
        toast.success('Đã cập nhật banner');
      } else {
        const created = await ContentService.createBanner(payload);
        setBanners((prev) => [...prev, created]);
        toast.success('Đã thêm banner mới');
      }
      setEditingBanner(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lưu banner thất bại';
      toast.error(typeof msg === 'string' ? msg : 'Lưu banner thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Nội Dung</h1>
          <p className="text-sm text-gray-500">Cấu hình Menu Header, Banner và Footer.</p>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide bg-white px-2 sticky top-0 z-20">
        <div className="flex gap-8 min-w-max">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTabId(t.id)}
              className={classNames(
                "py-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap px-1 text-sm font-medium outline-none",
                activeTabId === t.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[500px] mt-4 animate-in fade-in duration-300">
        {/* 1. MEGA MENU (TREE) */}
        {currentTab?.type === 'tree' && (
          <CategoryTreeManager />
        )}

        {/* 2. BANNERS */}
        {currentTab?.type === 'banner' && renderBannerList()}

        {/* 3. MENU EDITOR */}
        {currentTab?.type === 'menu' && (
          <MenuConfigEditor
            // Key quan trọng: Khi đổi tab -> Key đổi -> Component remount -> Reset state
            key={currentTab.id}
            title={currentTab.label}
            initialData={configData || []}
            loading={loading}
            onSave={handleSaveConfig}
          />
        )}

        {/* 4. FOOTER EDITOR */}
        {currentTab?.type === 'footer' && (
          <FooterConfigEditor
            initialData={configData || {}}
            loading={loading}
            onSave={handleSaveConfig}
          />
        )}
      </div>

      {/* Banner edit modal — render khi editingBanner != null */}
      {editingBanner && (
        <BannerFormModal
          initial={editingBanner}
          saving={loading}
          onCancel={() => setEditingBanner(null)}
          onSave={handleSaveBanner}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// BannerFormModal — inline form to create/edit banners (#61)
// ──────────────────────────────────────────────────────────────────────

interface BannerFormModalProps {
  initial: Partial<Banner>;
  saving: boolean;
  onCancel: () => void;
  onSave: (form: Partial<Banner>, file?: File | null) => void | Promise<void>;
}

const BANNER_LOCATIONS = [
  { value: 'HOMEPAGE', label: 'Trang chủ — banner chính' },
  { value: 'HERO_SUB', label: 'Banner phụ trang chủ' },
  { value: 'PRODUCT_DETAIL', label: 'Trang chi tiết sản phẩm' },
  { value: 'CATEGORY', label: 'Trang danh mục' },
];

const BannerFormModal: React.FC<BannerFormModalProps> = ({ initial, saving, onCancel, onSave }) => {
  const [form, setForm] = useState<Partial<Banner>>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial.src || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ảnh phải <= 5MB');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {form.id ? 'Sửa banner' : 'Thêm banner mới'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-700" aria-label="Đóng">
            <FiX size={20} />
          </button>
        </header>
        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form, file);
          }}
        >
          {/* Image upload */}
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Ảnh banner</span>
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:bg-white file:text-sm file:cursor-pointer hover:file:bg-gray-50"
              />
            </div>
          </label>

          {/* Title + Location */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</span>
              <input
                type="text"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                placeholder="VD: Sale Black Friday"
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Vị trí</span>
              <select
                value={form.location || 'HOMEPAGE'}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-200 outline-none text-sm bg-white"
              >
                {Object.entries(BANNER_LOCATION_MAP).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* CTA — đây là nội dung user feedback đề cập #61 */}
          <fieldset className="border border-gray-200 rounded p-3 space-y-3">
            <legend className="px-2 text-sm font-medium text-gray-700">Nút Call-to-Action</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs text-gray-600 mb-1">Nội dung button</span>
                <input
                  type="text"
                  value={form.ctaLabel || ''}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="VD: Mua ngay"
                />
              </label>
              <label className="block">
                <span className="block text-xs text-gray-600 mb-1">Đường dẫn (link)</span>
                <input
                  type="text"
                  value={form.ctaLink || ''}
                  onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="VD: /search?q=sale hoặc https://..."
                />
              </label>
            </div>
          </fieldset>

          {/* Description (optional) */}
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</span>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</span>
              <input
                type="number"
                value={form.order ?? 0}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </label>
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={form.isActive !== false}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Kích hoạt</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded font-medium disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};