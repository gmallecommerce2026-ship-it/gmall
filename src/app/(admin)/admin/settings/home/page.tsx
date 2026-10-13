'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/ApiClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash2, Edit, GripVertical, Plus, Save, X, LayoutTemplate, List, Eye, EyeOff, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Spec [0018]: toast feedback khi reorder/toggle
import { CategoryCascader } from '@/modules/seller/products/components/CategoryCascader';
import ProductSelector from '@/components/admin/marketing/ProductSelector';
import PointConfigCard from '../PointConfigCard';
// --- TYPE DEFINITIONS ---
type SectionType = 'CATEGORY' | 'CATEGORY_TWO_ROW' | 'FLASH_SALE';
type SourceType = 'CATEGORY' | 'MANUAL';

// Helper Wrapper cho Cascader
const CompactCascaderWrapper = ({ selectedId, onSelect }: any) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden h-[520px] bg-white shadow-inner relative">
      <div className="absolute inset-0 w-full h-full">
        <CategoryCascader
          selectedId={selectedId}
          onSelect={(id, path) => onSelect(id)}
          onClose={() => { }}
          allowSelectParent={true}
        />
      </div>
    </div>
  );
};

// --- PREVIEW COMPONENT ---
const PhonePreview = ({ section }: { section: any }) => {
  const { title, type, config } = section;

  return (
    <div className="bg-gray-50 h-full p-3 overflow-y-auto no-scrollbar font-sans text-xs">
      {/* Fake Status Bar */}
      <div className="flex justify-between text-[10px] text-gray-400 mb-2 px-1">
        <span>9:41</span>
        <div className="flex gap-1"><span>📶</span><span>🔋</span></div>
      </div>

      {/* Fake Search Bar */}
      <div className="h-8 bg-white rounded border border-gray-200 mb-3 shadow-sm flex items-center px-2 text-gray-300">
        Tìm kiếm...
      </div>

      {/* SECTION RENDER */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">

        {/* CASE 1: 2 CỘT */}
        {type === 'FLASH_SALE' ? (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800 uppercase text-sm">
                {config?.emoji || '⚡'} {title || 'Flash Sale'}
              </span>
              <span className="bg-black text-white rounded px-1.5 py-0.5 text-[10px] font-bold">02 : 15 : 00</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 min-w-[70px] h-20 rounded border border-gray-200 flex items-center justify-center text-gray-400">Img</div>
              ))}
            </div>
          </div>
        ) : type === 'CATEGORY_TWO_ROW' ? (
          <div className="p-2">
            <div className="grid grid-cols-2 gap-2 h-32">
              {/* Left Col */}
              <div className="border border-blue-100 bg-blue-50/30 rounded p-1 flex flex-col">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-base">{config?.left?.emoji || '🔥'}</span>
                  <span className={`font-bold text-gray-800 truncate ${config?.left?.headerColor || 'text-gray-800'}`}>
                    {config?.left?.title || 'Tiêu đề trái'}
                  </span>
                </div>
                <div className="flex-1 bg-white rounded border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                  Product List
                </div>
              </div>
              {/* Right Col */}
              <div className="border border-orange-100 bg-orange-50/30 rounded p-1 flex flex-col">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-base">{config?.right?.emoji || '🆕'}</span>
                  <span className={`font-bold text-gray-800 truncate ${config?.right?.headerColor || 'text-gray-800'}`}>
                    {config?.right?.title || 'Tiêu đề phải'}
                  </span>
                </div>
                <div className="flex-1 bg-white rounded border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                  Product List
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 2: NORMAL CATEGORY */
          <div className="p-3">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-1">
                {config?.emoji && <span className="text-base">{config.emoji}</span>}
                <span className={`${config?.titleSize || 'text-sm'} font-bold text-gray-800 uppercase`}>
                  {title || 'Tiêu đề Section'}
                </span>
              </div>
              {config?.showPopup && <span className="text-[9px] text-blue-500">Xem thêm &gt;</span>}
            </div>

            {/* Content Simulation */}
            <div className={`
                   ${config?.mobileLayout === 'scroll' ? 'flex overflow-x-auto gap-2 pb-1' : ''}
                   ${config?.mobileLayout === 'grid' ? 'grid grid-cols-2 gap-2' : ''}
                   ${config?.mobileLayout === 'stack' ? 'flex flex-col gap-2' : ''}
                `}>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 min-w-[70px] h-20 rounded border border-gray-200 flex items-center justify-center text-gray-400">
                  Img
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function HomeSettingsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // hooks-fix wiki 0031: declare loadSections before useEffect (was immutability/use-before-declared) + useCallback
  const loadSections = useCallback(async () => {
    try {
      const res = await apiClient.get('/home-settings');
      const sectionsData = Array.isArray(res) ? res : (res?.data || []);
      setSections(sectionsData);
    } catch (e) {
      console.error(e);
      setSections([]);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSections(); }, [loadSections]);

  const handleSave = async (data: any) => {
    try {
      if (editingItem?.id) {
        await apiClient.patch(`/home-settings/${editingItem.id}`, data);
      } else {
        await apiClient.post('/home-settings', data);
      }
      setIsModalOpen(false);
      loadSections();
    } catch (e: any) { alert(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa khối này?")) return;
    await apiClient.delete(`/home-settings/${id}`);
    loadSections();
  }

  // Spec [0018]: optimistic reorder + rollback nếu API fail.
  // Trước đây fail im lặng, admin tưởng đã lưu nhưng F5 thì thứ tự cũ.
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const previous = sections;
    const items = Array.from(sections);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setSections(items);

    try {
      await apiClient.post('/home-settings/reorder', { ids: items.map(i => i.id) });
      toast.success('Đã lưu thứ tự mới', { duration: 1500 });
    } catch (e: any) {
      console.error('[home-settings] reorder fail:', e);
      toast.error('Không lưu được thứ tự, đã hoàn tác');
      setSections(previous); // rollback
    }
  };

  // Spec [0018]: toggle isActive (ẩn/hiện khối) — schema đã có flag, UI chưa cho dùng.
  const handleToggleActive = async (section: any) => {
    const newValue = !section.isActive;
    const previous = sections;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, isActive: newValue } : s));
    try {
      await apiClient.patch(`/home-settings/${section.id}`, { isActive: newValue });
      toast.success(newValue ? 'Đã hiển thị khối' : 'Đã ẩn khối khỏi homepage');
    } catch (e) {
      toast.error('Không cập nhật được trạng thái');
      setSections(previous);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-8 h-screen overflow-hidden">
      <PointConfigCard />
      {/* LEFT: LIST (Scrollable) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cấu hình Trang Chủ</h1>
            <p className="text-gray-500 text-sm">Kéo thả để sắp xếp các khối danh mục sản phẩm</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-brand-orange text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-600 shadow-sm font-medium transition"
          >
            <Plus size={18} /> Thêm Khối Mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-20">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 rounded-xl border flex items-center gap-4 group transition-all ${snapshot.isDragging ? 'bg-blue-50 border-blue-300 shadow-lg' : 'bg-white shadow-sm border-gray-100 hover:border-brand-orange/50'} ${!section.isActive ? 'opacity-50' : ''}`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-600 p-1">
                            <GripVertical size={20} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              {section.type === 'FLASH_SALE' ? <Zap size={18} className="text-yellow-500" /> : section.type === 'CATEGORY_TWO_ROW' ? <LayoutTemplate size={18} className="text-purple-500" /> : <List size={18} className="text-blue-500" />}

                              <span className="font-bold text-gray-800">
                                {section.title || (section.type === 'CATEGORY_TWO_ROW' ? 'Khối 2 Cột (Split)' : 'Chưa đặt tên')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 pl-8">
                              {section.type === 'FLASH_SALE'
                                ? <span className="text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">⚡ Flash Sale</span>
                                : section.type === 'CATEGORY_TWO_ROW'
                                  ? <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">2 Cột: {section.config?.left?.title} | {section.config?.right?.title}</span>
                                  : `Kiểu: ${section.config?.mobileLayout || 'Scroll'} • Size: ${section.config?.titleSize || 'Normal'}`
                              }
                            </div>
                          </div>

                          <div className="flex gap-1 items-center">
                            {/* Spec [0018]: toggle ẩn/hiện luôn visible (không hover) để admin dễ thấy trạng thái */}
                            <button
                              onClick={() => handleToggleActive(section)}
                              className={`p-2 rounded transition-colors ${section.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                              title={section.isActive ? 'Đang hiển thị — bấm để ẩn' : 'Đang ẩn — bấm để hiển thị'}
                            >
                              {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button onClick={() => { setEditingItem(section); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" title="Chỉnh sửa"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(section.id)} className="p-2 hover:bg-gray-100 rounded text-red-600 opacity-60 group-hover:opacity-100 transition-opacity" title="Xoá"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {isModalOpen && <EditorModal initialData={editingItem} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}

// --- FLASH SALE: QUẢN LÝ SẢN PHẨM TRONG KHUNG GIỜ ---
// Sản phẩm gắn vào KHUNG GIỜ (FlashSaleProduct), không gắn vào khối, nên thêm/gỡ
// có hiệu lực ngay (không cần bấm "Lưu Cấu Hình" của khối).
type FsItem = {
  id: string;
  productId: string;
  name: string;
  image: string | null;
  variantLabel: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  sold: number;
  status: string;
};
type FsVariant = { id: string; label: string; price: number; stock: number };
type FsProduct = { id: string; name: string; image: string | null; shopName: string | null; variants: FsVariant[] };
type FsDraft = { productId: string; productName: string; variantId: string; variantLabel: string; price: number; stock: number };

const fsMoney = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;
const fsArr = (res: any): any[] => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

function FlashSaleItemsPanel({ sessionId, ended, onChanged }: { sessionId: string; ended?: boolean; onChanged?: () => void }) {
  const [items, setItems] = useState<FsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<FsProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [draft, setDraft] = useState<FsDraft | null>(null);
  const [promoPrice, setPromoPrice] = useState('');
  const [promoStock, setPromoStock] = useState('');
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/flash-sale/sessions/${sessionId}/products`);
      setItems(fsArr(res));
    } catch (e: any) {
      toast.error(e?.message || 'Không tải được sản phẩm của khung giờ');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Đổi khung giờ => reset form + tải lại danh sách
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setDraft(null);
    setResults([]);
    setKeyword('');
    loadItems();
  }, [loadItems]);

  // Tìm sản phẩm (debounce 400ms)
  useEffect(() => {
    const kw = keyword.trim();
    if (kw.length < 2) { setResults([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get('/admin/flash-sale/product-search', { params: { keyword: kw } });
        if (alive) setResults(fsArr(res));
      } catch (e: any) {
        if (alive) toast.error(e?.message || 'Tìm kiếm thất bại');
      } finally {
        if (alive) setSearching(false);
      }
    }, 400);
    return () => { alive = false; clearTimeout(t); };
  }, [keyword]);

  const pickVariant = (p: FsProduct, v: FsVariant) => {
    setDraft({ productId: p.id, productName: p.name, variantId: v.id, variantLabel: v.label, price: v.price, stock: v.stock });
    setPromoPrice('');
    setPromoStock(String(Math.min(v.stock, 10)));
  };

  const submit = async () => {
    if (!draft) return;
    const price = Number(promoPrice);
    const stock = Math.floor(Number(promoStock));
    if (!Number.isFinite(price) || price <= 0 || price >= draft.price) {
      toast.error(`Giá flash sale phải nhỏ hơn giá gốc (${fsMoney(draft.price)})`);
      return;
    }
    if (!Number.isFinite(stock) || stock < 1 || stock > draft.stock) {
      toast.error(`Số suất phải từ 1 đến tồn kho (${draft.stock})`);
      return;
    }
    setSaving(true);
    try {
      await apiClient.post(`/admin/flash-sale/sessions/${sessionId}/products`, {
        productId: draft.productId,
        variantId: draft.variantId,
        promoPrice: price,
        promoStock: stock,
      });
      toast.success('Đã thêm sản phẩm vào khung giờ');
      setDraft(null);
      await loadItems();
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.message || 'Không thêm được sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: FsItem) => {
    if (!confirm(`Gỡ "${it.name}" khỏi khung giờ này?`)) return;
    try {
      await apiClient.delete(`/admin/flash-sale/products/${it.id}`);
      toast.success('Đã gỡ sản phẩm');
      await loadItems();
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.message || 'Không gỡ được sản phẩm');
    }
  };

  const percent = draft && Number(promoPrice) > 0 && Number(promoPrice) < draft.price
    ? Math.round(((draft.price - Number(promoPrice)) / draft.price) * 100)
    : null;

  return (
    <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase text-gray-800">Sản phẩm trong khung giờ này</h4>
        <span className="text-xs text-gray-500">{items.length} sản phẩm</span>
      </div>

      {/* DANH SÁCH ĐÃ THÊM */}
      <div className="max-h-64 overflow-y-auto rounded border border-gray-200 bg-white">
        {loading ? (
          <p className="p-3 text-sm text-gray-500">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">Chưa có sản phẩm nào — khối sẽ không hiện trên trang chủ cho tới khi có ít nhất 1 sản phẩm.</p>
        ) : (
          items.map(it => (
            <div key={it.id} className="flex items-center gap-3 border-b border-gray-100 p-2 last:border-0">
              {it.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={it.image} alt="" className="h-12 w-12 flex-shrink-0 rounded object-cover" />
                : <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{it.name}</p>
                <p className="truncate text-xs text-gray-500">{it.variantLabel}</p>
                <p className="text-xs">
                  <span className="font-bold text-orange-600">{fsMoney(it.salePrice)}</span>{' '}
                  <span className="text-gray-400 line-through">{fsMoney(it.originalPrice)}</span>
                  <span className="ml-2 text-gray-500">Đã bán {it.sold}/{it.stock}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(it)}
                disabled={it.sold > 0}
                title={it.sold > 0 ? 'Đã có người mua, không thể gỡ' : 'Gỡ khỏi khung giờ'}
                className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* THÊM SẢN PHẨM */}
      {ended ? (
        <p className="text-xs italic text-gray-500">Khung giờ đã kết thúc nên không thể thêm sản phẩm.</p>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-600">Thêm sản phẩm</label>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Nhập tên sản phẩm (từ 2 ký tự)..."
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {searching && <p className="text-xs text-gray-500">Đang tìm...</p>}

          {results.length > 0 && (
            <div className="max-h-72 overflow-y-auto rounded border border-gray-200 bg-white">
              {results.map(p => (
                <div key={p.id} className="border-b border-gray-100 p-2 last:border-0">
                  <div className="flex items-center gap-2">
                    {p.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.image} alt="" className="h-10 w-10 flex-shrink-0 rounded object-cover" />
                      : <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                      {p.shopName && <p className="text-xs text-gray-400">{p.shopName}</p>}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 pl-12">
                    {p.variants.length === 0 ? (
                      <span className="text-xs text-red-500">Sản phẩm chưa có biến thể nên không thể thêm</span>
                    ) : p.variants.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => pickVariant(p, v)}
                        disabled={v.stock < 1}
                        className={`rounded border px-2 py-1 text-xs hover:border-orange-500 hover:text-orange-600 disabled:opacity-40 ${draft?.variantId === v.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-300'}`}
                      >
                        {v.label} · {fsMoney(v.price)} · kho {v.stock}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {draft && (
            <div className="space-y-3 rounded border border-orange-300 bg-white p-3">
              <p className="text-sm">
                <span className="font-semibold">{draft.productName}</span>{' '}
                <span className="text-gray-500">({draft.variantLabel})</span>
              </p>
              <p className="text-xs text-gray-500">Giá gốc {fsMoney(draft.price)} · Tồn kho {draft.stock}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Giá flash sale (đ)</label>
                  <input
                    type="number" min={1} value={promoPrice}
                    onChange={e => setPromoPrice(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-orange-500"
                  />
                  {percent !== null && <p className="mt-1 text-xs text-green-600">Giảm {percent}%</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Số suất (tối đa {draft.stock})</label>
                  <input
                    type="number" min={1} max={draft.stock} value={promoStock}
                    onChange={e => setPromoStock(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setDraft(null)} className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Huỷ</button>
                <button
                  type="button" onClick={submit} disabled={saving}
                  className="rounded bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Thêm vào flash sale'}
                </button>
              </div>
              <p className="text-[10px] italic text-gray-400">* Thêm lại cùng biến thể sẽ cập nhật giá/số suất.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- MODAL EDITOR COMPONENT ---
function EditorModal({ initialData, onClose, onSave }: any) {
  const [type, setType] = useState<SectionType>(initialData?.type || 'CATEGORY');
  const [title, setTitle] = useState(initialData?.title || '');
  const [manualShopId, setManualShopId] = useState(initialData?.config?.shopId || '');
  // State cho loại CATEGORY (Danh mục đơn)
  const [sourceType, setSourceType] = useState<SourceType>(initialData?.config?.sourceType || 'CATEGORY');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialData?.config?.productIds || []);

  // State Config chung, bao gồm cấu hình cho 2 cột (left/right)
  const [config, setConfig] = useState(initialData?.config || {
    mobileLayout: 'scroll',
    titleSize: 'text-lg',
    showPopup: false,
    left: {
      title: 'Bán chạy',
      emoji: '🔥',
      headerColor: 'text-orange-600',
      sourceType: 'CATEGORY',
      categoryId: '',
      productIds: [],
      shopId: '',
      filters: []
    },
    right: {
      title: 'Mới nhất',
      emoji: '🆕',
      headerColor: 'text-blue-600',
      sourceType: 'CATEGORY',
      categoryId: '',
      productIds: [],
      shopId: '',
      filters: []
    }
  });

  const previewData = { title, type, config };
  const [sessions, setSessions] = useState<any[]>([]);
  // Tăng số này để tải lại danh sách khung giờ (cập nhật số "SP" sau khi thêm/gỡ sản phẩm)
  const [sessionsTick, setSessionsTick] = useState(0);
  useEffect(() => {
    if (type !== 'FLASH_SALE') return;
    let alive = true;
    apiClient.get('/admin/flash-sale/sessions')
      .then((res: any) => { if (alive) setSessions(Array.isArray(res) ? res : (res?.data || [])); })
      .catch(() => { if (alive) setSessions([]); });
    return () => { alive = false; };
  }, [type, sessionsTick]);
  const handleChangeConfig = (key: string, val: any) => setConfig((prev: any) => ({ ...prev, [key]: val }));

  const handleDeepConfig = (section: 'left' | 'right', key: string, val: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: val }
    }));
  };

  const handleSubmit = () => {
    if (type === 'FLASH_SALE' && !config.sessionId) {
      alert('Vui lòng chọn khung giờ Flash Sale');
      return;
    }
    let finalTitle = title;
    if (type === 'CATEGORY_TWO_ROW' && !finalTitle) finalTitle = "Two Row Section";
    if (type === 'FLASH_SALE' && !finalTitle) finalTitle = "Flash Sale";

    onSave({
      title: finalTitle,
      type,
      categoryId: (type === 'CATEGORY' && sourceType === 'CATEGORY') ? categoryId : null,
      productIds: (type === 'CATEGORY' && sourceType === 'MANUAL') ? selectedProductIds : [],
      config: {
        ...config,
        ...(type === 'CATEGORY' && sourceType === 'MANUAL' ? { shopId: manualShopId } : {})
      },
      sourceType,
    });
  };

  // --- RENDER CONFIG CHO MỖI CỘT TRONG KHỐI 2 CỘT ---
  const renderColumnConfig = (side: 'left' | 'right', label: string, colorClass: string) => {
    const currentSourceType = config[side].sourceType || 'CATEGORY';

    return (
      <div className={`p-4 rounded-xl border ${colorClass === 'blue' ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
        <label className={`text-xs font-bold uppercase mb-3 block ${colorClass === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>
          {label}
        </label>

        {/* Cấu hình cơ bản */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          <div className="col-span-3">
            <label className="text-[10px] text-gray-500 mb-1 block">Emoji</label>
            <input className="w-full border rounded p-2 text-center"
              value={config[side].emoji}
              onChange={e => handleDeepConfig(side, 'emoji', e.target.value)}
            />
          </div>
          <div className="col-span-9">
            <label className="text-[10px] text-gray-500 mb-1 block">Tiêu đề</label>
            <input className="w-full border rounded p-2 font-medium"
              value={config[side].title}
              onChange={e => handleDeepConfig(side, 'title', e.target.value)}
              placeholder="Tiêu đề..."
            />
          </div>
        </div>

        {/* CHỌN NGUỒN DỮ LIỆU */}
        <div className="bg-white p-2 rounded border border-gray-200">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded p-1 mb-3">
            <button
              onClick={() => handleDeepConfig(side, 'sourceType', 'CATEGORY')}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded transition ${currentSourceType === 'CATEGORY' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              TỰ ĐỘNG (DANH MỤC)
            </button>
            <button
              onClick={() => handleDeepConfig(side, 'sourceType', 'MANUAL')}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded transition ${currentSourceType === 'MANUAL' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              CHỌN TAY (MANUAL)
            </button>
          </div>

          {/* Option 1: CATEGORY */}
          {currentSourceType === 'CATEGORY' && (
            <>
              {config[side].categoryId ? (
                <div className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
                  <span className="text-xs font-bold text-green-600 truncate">ID: {config[side].categoryId}</span>
                  <button onClick={() => handleDeepConfig(side, 'categoryId', '')} className="text-red-500 text-xs hover:underline">Đổi</button>
                </div>
              ) : (
                <div className="mb-2">
                  <CompactCascaderWrapper
                    selectedId={config[side].categoryId}
                    onSelect={(id: string) => handleDeepConfig(side, 'categoryId', id)}
                  />
                </div>
              )}
              <div className="text-[10px] text-gray-400 mt-1 italic">* Tự động lấy sản phẩm mới nhất.</div>
            </>
          )}

          {/* Option 2: MANUAL PRODUCTS */}
          {currentSourceType === 'MANUAL' && (
            <div className="space-y-2">
              <div className="max-h-[300px] overflow-y-auto border rounded bg-gray-50">
                <ProductSelector
                  selectedIds={Array.isArray(config[side].productIds) ? config[side].productIds : []}

                  // --- PHẦN QUAN TRỌNG CẦN THÊM ---
                  // Truyền shopId đã lưu vào để component con biết shop nào đang active
                  shopId={config[side].shopId}

                  // Khi người dùng đổi shop trong selector, lưu lại shopId mới
                  onShopChange={(newShopId: string) => handleDeepConfig(side, 'shopId', newShopId)}
                  // --------------------------------

                  onChange={(ids) => handleDeepConfig(side, 'productIds', ids)}
                />
              </div>
              <p className="text-[10px] text-blue-500 font-medium">
                Đã chọn: {(config[side].productIds || []).length} sản phẩm.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      {/* Full Screen Modal */}
      <div className="bg-white rounded-2xl w-[98vw] h-[95vh] flex overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

        {/* COL 1: SETTINGS FORM */}
        <div className="flex-1 flex flex-col h-full border-r border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Chỉnh sửa Khối' : 'Thêm Khối Mới'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* 1. SECTION TYPE SELECTOR */}
            <section>
              <label className="text-xs font-bold text-gray-500 uppercase mb-3 block tracking-wide">1. Chọn Loại Khối</label>
              <div className="grid grid-cols-2 gap-4">
                <TypeCard
                  active={type === 'CATEGORY'}
                  onClick={() => setType('CATEGORY')}
                  icon={<List size={24} />}
                  title="Danh mục đơn / List"
                  desc="1 Hàng hoặc Grid"
                />
                <TypeCard
                  active={type === 'CATEGORY_TWO_ROW'}
                  onClick={() => setType('CATEGORY_TWO_ROW')}
                  icon={<LayoutTemplate size={24} />}
                  title="Chia đôi (Split 2 Row)"
                  desc="Trái & Phải riêng biệt"
                />
                <TypeCard
                  active={type === 'FLASH_SALE'}
                  onClick={() => setType('FLASH_SALE')}
                  icon={<Zap size={24} />}
                  title="Flash Sale"
                  desc="Đếm ngược, tự ẩn khi hết giờ"
                />
              </div>
            </section>

            {/* 2. DYNAMIC SETTINGS */}
            <section className="animate-in slide-in-from-right-4 duration-300">

              {/* --- CASE A: TWO ROW CONFIG --- */}
              {type === 'CATEGORY_TWO_ROW' && (
                <div className="grid grid-cols-2 gap-6">
                  {renderColumnConfig('left', 'Cột Trái (Left)', 'blue')}
                  {renderColumnConfig('right', 'Cột Phải (Right)', 'orange')}
                </div>
              )}

              {/* --- CASE B: SINGLE CATEGORY --- */}
              {type === 'CATEGORY' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                      <input className="w-full border p-2.5 rounded-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Emoji</label>
                      <input className="w-full border p-2.5 rounded-lg text-center" value={config.emoji || ''} onChange={e => handleChangeConfig('emoji', e.target.value)} />
                    </div>
                  </div>

                  {/* --- SOURCE SELECTOR --- */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 flex">
                      <button onClick={() => setSourceType('CATEGORY')} className={`flex-1 py-3 text-sm font-medium ${sourceType === 'CATEGORY' ? 'bg-white text-brand-orange border-b-2 border-brand-orange' : 'text-gray-500'}`}>Tự động từ Danh mục</button>
                      <button onClick={() => setSourceType('MANUAL')} className={`flex-1 py-3 text-sm font-medium ${sourceType === 'MANUAL' ? 'bg-white text-brand-orange border-b-2 border-brand-orange' : 'text-gray-500'}`}>Chọn thủ công</button>
                    </div>

                    <div className="p-4 bg-white min-h-[300px]">
                      {sourceType === 'CATEGORY' ? (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Chọn Danh Mục Nguồn:</label>

                          <CompactCascaderWrapper
                            selectedId={categoryId}
                            onSelect={(id: string) => setCategoryId(id)}
                          />

                          {categoryId && <p className="text-sm text-green-600 font-medium mt-2">✅ ID: {categoryId}</p>}
                        </div>
                      ) : (
                        <ProductSelector
                          selectedIds={selectedProductIds}

                          // --- PHẦN QUAN TRỌNG CẦN THÊM ---
                          shopId={manualShopId}
                          onShopChange={(id: string) => setManualShopId(id)}
                          // --------------------------------

                          onChange={setSelectedProductIds}
                        />
                      )}
                    </div>
                  </div>

                  {/* Visual Config */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kiểu hiển thị Mobile</label>
                      <select className="w-full border p-2 rounded-lg bg-white" value={config.mobileLayout} onChange={e => handleChangeConfig('mobileLayout', e.target.value)}>
                        <option value="scroll">Vuốt ngang (Scroll)</option>
                        <option value="grid">Lưới 2 cột (Grid)</option>
                        <option value="stack">Xếp dọc (Stack)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kích thước Tiêu đề</label>
                      <select className="w-full border p-2 rounded-lg bg-white" value={config.titleSize} onChange={e => handleChangeConfig('titleSize', e.target.value)}>
                        <option value="text-base">Nhỏ</option>
                        <option value="text-lg">Vừa</option>
                        <option value="text-xl">Lớn</option>
                        <option value="text-2xl font-bold">Rất lớn (Bold)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {/* --- CASE C: FLASH SALE --- */}
              {type === 'FLASH_SALE' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                      <input className="w-full border p-2.5 rounded-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="FLASH SALE" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Emoji</label>
                      <input className="w-full border p-2.5 rounded-lg text-center" value={config.emoji || ''} onChange={e => handleChangeConfig('emoji', e.target.value)} placeholder="⚡" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Khung giờ Flash Sale</label>
                    <select
                      className="w-full border p-2.5 rounded-lg bg-white"
                      value={config.sessionId || ''}
                      onChange={e => handleChangeConfig('sessionId', e.target.value)}
                    >
                      <option value="">-- Chọn khung giờ --</option>
                      {sessions
                        .filter(s => s.timeStatus !== 'ENDED' || s.id === config.sessionId)
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {new Date(s.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            {' → '}
                            {new Date(s.endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            {' • '}{s.timeStatus === 'ONGOING' ? 'Đang diễn ra' : s.timeStatus === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                            {' • '}{s._count?.products ?? 0} SP
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2 italic">
                      * Trang chủ hiện đồng hồ đếm ngược ở góc phải. Hết giờ, khối tự ẩn. Khung giờ chưa bắt đầu thì khối chưa hiện.
                    </p>
                  </div>

                  {/* Thêm / gỡ sản phẩm của khung giờ đã chọn */}
                  {config.sessionId && (
                    <FlashSaleItemsPanel
                      sessionId={config.sessionId}
                      ended={sessions.find(s => s.id === config.sessionId)?.timeStatus === 'ENDED'}
                      onChanged={() => setSessionsTick(t => t + 1)}
                    />
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Hủy bỏ</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-brand-orange text-white font-bold rounded-lg shadow-sm hover:bg-orange-600 flex items-center gap-2 transition transform active:scale-95">
              <Save size={18} /> Lưu Cấu Hình
            </button>
          </div>
        </div>

        {/* COL 2: LIVE PREVIEW */}
        <div className="w-[360px] bg-gray-100 border-l border-gray-200 p-6 flex flex-col items-center justify-center shrink-0">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mobile Live Preview</h3>

          <div className="w-[300px] h-[600px] bg-white rounded-[40px] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden ring-4 ring-gray-200">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
            <div className="h-full w-full pt-8">
              <PhonePreview section={previewData} />
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full opacity-20"></div>
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center max-w-[200px]">
            Đây là mô phỏng hiển thị trên ứng dụng/website mobile.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENT ---
function TypeCard({ active, onClick, icon, title, desc }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden group
        ${active
          ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-orange-500 shadow-md'
          : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
        }
      `}
    >
      <div className={`mb-2 ${active ? 'text-brand-orange' : 'text-gray-400 group-hover:text-brand-orange'}`}>{icon}</div>
      <div className="font-bold text-sm mb-1 text-gray-800">{title}</div>
      <div className="text-[10px] text-gray-500 leading-tight">{desc}</div>
      {active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange"></div>}
    </button>
  );
}