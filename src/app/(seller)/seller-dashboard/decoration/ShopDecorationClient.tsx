'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/ApiClient'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; 
import { Trash2, GripVertical, Save, Image as ImageIcon, LayoutGrid, Ticket, Video, Palette, Smartphone, Upload, X, Check, Loader2, PlayCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadFileToR2 } from '@/services/uploadService'; // Đảm bảo import đúng service
import Image from 'next/image';

// --- TYPES ---
type ComponentType = 'BANNER_CAROUSEL' | 'PRODUCT_HIGHLIGHT' | 'VIDEO' | 'VOUCHER_LIST';

interface ShopSection {
  id: string;
  type: ComponentType;
  title?: string;
  config: any;
}

interface PageSettings {
  backgroundColor: string;
  backgroundImage?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    images: any;
}

// --- CONFIG BLOCKS DATA ---
const AVAILABLE_BLOCKS = [
  { type: 'BANNER_CAROUSEL', label: 'Banner Quay', icon: <ImageIcon size={20}/>, desc: 'Slide ảnh chạy ngang' },
  { type: 'PRODUCT_HIGHLIGHT', label: 'Sản phẩm nổi bật', icon: <LayoutGrid size={20}/>, desc: 'Danh sách sản phẩm tùy chọn' },
  { type: 'VOUCHER_LIST', label: 'Mã giảm giá', icon: <Ticket size={20}/>, desc: 'Hiển thị các Voucher của Shop' },
  { type: 'VIDEO', label: 'Video', icon: <Video size={20}/>, desc: 'Video YouTube/Upload' },
];

export default function ShopDecorationClient() {
  const [sections, setSections] = useState<ShopSection[]>([]);
  const [activeSection, setActiveSection] = useState<ShopSection | null>(null);
  const [pageSettings, setPageSettings] = useState<PageSettings>({ backgroundColor: '#f9fafb' });
  const [loading, setLoading] = useState(true);
  
  // State Upload
  const [uploading, setUploading] = useState(false);

  // State Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiClient.get('/shops/me/decoration');
        if (res?.decoration) {
            setSections(res.decoration.sections || []);
            setPageSettings(res.decoration.settings || { backgroundColor: '#f9fafb' });
        }
      } catch (error) {
        console.error("Load decoration failed", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data
  const handleSave = async () => {
    try {
      const payload = {
        decoration: {
            sections,
            settings: pageSettings
        }
      };
      await apiClient.put('/shops/me/decoration', payload);
      toast.success('Đã lưu giao diện Shop!');
    } catch (e) {
      toast.error('Lưu thất bại');
    }
  };

  const addBlock = (type: ComponentType) => {
    const newBlock: ShopSection = {
      id: `section_${Date.now()}`,
      type,
      config: getDefaultConfig(type)
    };
    setSections([...sections, newBlock]);
    setActiveSection(newBlock);
  };

  const updateActiveSection = (key: string, value: any) => {
    if (!activeSection) return;
    const updated = { ...activeSection, config: { ...activeSection.config, [key]: value } };
    if (key === 'title_root') updated.title = value; // Cập nhật title gốc của section
    setActiveSection(updated);
    setSections(sections.map(s => s.id === activeSection.id ? updated : s));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (activeSection?.id === id) setActiveSection(null);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  // --- HANDLER: UPLOAD ẢNH ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'banner' | 'video_cover' | 'bg') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
        setUploading(true);
        // Gọi service upload lên R2 (đã config ở backend)
        const url = await uploadFileToR2(file);
        
        if (field === 'banner' && activeSection?.type === 'BANNER_CAROUSEL') {
            const currentImages = activeSection.config.images || [];
            updateActiveSection('images', [...currentImages, url]);
        } else if (field === 'video_cover' && activeSection?.type === 'VIDEO') {
            updateActiveSection('cover', url);
        } else if (field === 'bg') {
            setPageSettings(prev => ({ ...prev, backgroundImage: url }));
        }
        toast.success("Tải ảnh thành công");
    } catch (error) {
        toast.error("Tải ảnh thất bại");
        console.error(error);
    } finally {
        setUploading(false);
        // Reset input value để chọn lại cùng file nếu muốn
        e.target.value = '';
    }
  };

  // --- HANDLER: CHỌN SẢN PHẨM ---
  const openProductModal = async () => {
      setShowProductModal(true);
      // Chỉ tải lại nếu chưa có data để tiết kiệm request
      if (sellerProducts.length === 0) {
          setModalLoading(true);
          try {
              // [FIX] Sử dụng Endpoint dành riêng cho Seller để tìm sản phẩm của chính mình
              // Endpoint này được định nghĩa trong SellerProductController: @Get('my-products')
              const res = await apiClient.get('/seller/products/my-products', {
                  params: { limit: 50 } 
              });
              console.log("resress ", res)
              const productsData = Array.isArray(res) 
                  ? res 
                  : (res?.data || res?.items || []);

              setSellerProducts(productsData);
          } catch (e) {
              console.error("Lỗi tải sản phẩm modal:", e);
              toast.error("Không tải được danh sách sản phẩm");
          } finally {
              setModalLoading(false);
          }
      }
  };

  const toggleProductSelection = (productId: string) => {
      if (!activeSection) return;
      const currentIds = activeSection.config.productIds || [];
      let newIds;
      if (currentIds.includes(productId)) {
          newIds = currentIds.filter((id: string) => id !== productId);
      } else {
          // Giới hạn chọn tối đa theo config limit
          if (currentIds.length >= (activeSection.config.limit || 4)) {
               toast.error(`Chỉ được chọn tối đa ${activeSection.config.limit} sản phẩm`);
               return;
          }
          newIds = [...currentIds, productId];
      }
      updateActiveSection('productIds', newIds);
  };

  // --- HELPER ---
  const getImageUrl = (imgData: any) => {
      if(typeof imgData === 'string') return imgData;
      if(Array.isArray(imgData) && imgData[0]) return typeof imgData[0] === 'string' ? imgData[0] : imgData[0].url;
      return '/placeholder.png';
  }

  const getDefaultConfig = (type: ComponentType) => {
    switch(type) {
        case 'BANNER_CAROUSEL': return { images: [], height: 150 };
        case 'PRODUCT_HIGHLIGHT': return { type: 'auto', limit: 4, title: 'Gợi ý cho bạn', productIds: [] };
        case 'VOUCHER_LIST': return { auto: true };
        case 'VIDEO': return { url: '', cover: '' };
        default: return {};
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange"/></div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-100 overflow-hidden relative">
        {/* TOP BAR */}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
            <div>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Palette className="text-brand-orange" /> Trang Trí Shop
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Kéo thả để thiết kế giao diện hiển thị trên Mobile</p>
            </div>
            <div className="flex gap-3">
                <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-brand-orange rounded-md shadow hover:bg-orange-600 flex items-center gap-2 transition">
                    <Save size={16} /> Áp dụng
                </button>
            </div>
        </div>

        {/* WORKSPACE */}
        <div className="flex flex-1 overflow-hidden">
            {/* 1. LEFT SIDEBAR: COMPONENT LIBRARY */}
            <div className="w-[280px] bg-white border-r flex flex-col z-20 shadow-lg">
                <div className="p-4 border-b">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">Thư viện Component</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                    {AVAILABLE_BLOCKS.map(block => (
                        <button 
                            key={block.type}
                            onClick={() => addBlock(block.type as ComponentType)}
                            className="flex flex-col items-center p-3 border rounded-lg hover:border-brand-orange hover:bg-orange-50 transition text-center group"
                        >
                            <div className="mb-2 text-gray-500 group-hover:text-brand-orange">{block.icon}</div>
                            <span className="text-xs font-medium text-gray-700">{block.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* GLOBAL SETTINGS */}
                <div className="mt-auto p-4 border-t bg-gray-50">
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Thiết lập chung</h3>
                     <div className="space-y-4">
                        <div>
                            <label className="text-xs block mb-1 font-medium text-gray-600">Màu nền trang</label>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="color" 
                                    value={pageSettings.backgroundColor}
                                    onChange={(e) => setPageSettings({...pageSettings, backgroundColor: e.target.value})}
                                    className="h-8 w-12 cursor-pointer border rounded p-0.5 bg-white"
                                />
                                <span className="text-xs font-mono">{pageSettings.backgroundColor}</span>
                            </div>
                        </div>
                        <div>
                             <label className="text-xs block mb-1 font-medium text-gray-600">Ảnh nền (Tùy chọn)</label>
                             <div className="flex gap-2">
                                 {pageSettings.backgroundImage ? (
                                     <div className="relative w-16 h-10 border rounded overflow-hidden group">
                                         <Image src={pageSettings.backgroundImage} alt="BG" fill className="object-cover" />
                                         <button 
                                            onClick={() => setPageSettings({...pageSettings, backgroundImage: ''})}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                                         >
                                             <X size={14}/>
                                         </button>
                                     </div>
                                 ) : (
                                     <label className="flex items-center justify-center h-10 w-16 border border-dashed rounded cursor-pointer hover:bg-gray-100">
                                         <Upload size={14} className="text-gray-400"/>
                                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg')} />
                                     </label>
                                 )}
                                 <div className="flex-1 text-[10px] text-gray-400 leading-tight">
                                     Tải ảnh nền để thay thế màu đơn sắc.
                                 </div>
                             </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* 2. CENTER CANVAS: PHONE PREVIEW */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-hidden relative">
                 {/* Grid Background */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 
                 <div className="w-[375px] h-[700px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-800 flex flex-col overflow-hidden relative z-0">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
                      <div className="h-8 bg-white shrink-0"></div>
                      
                      {/* Fake Header */}
                      <div className="h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                          <div className="flex-1 space-y-1">
                              <div className="h-3 w-20 bg-gray-200 rounded"></div>
                              <div className="h-2 w-12 bg-gray-100 rounded"></div>
                          </div>
                      </div>

                      {/* SCROLLABLE AREA */}
                      <div 
                        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative"
                        style={{ 
                            backgroundColor: pageSettings.backgroundColor,
                            backgroundImage: pageSettings.backgroundImage ? `url(${pageSettings.backgroundImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundAttachment: 'local'
                        }}
                      >
                         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="shop-sections">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="pb-10 min-h-[200px]">
                                        {sections.map((section, index) => (
                                            <Draggable key={section.id} draggableId={section.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        onClick={() => setActiveSection(section)}
                                                        className={`relative group cursor-pointer border-2 border-transparent transition-all ${activeSection?.id === section.id ? '!border-brand-orange z-10 shadow-lg' : 'hover:border-blue-200'}`}
                                                    >
                                                        {/* Context Menu (Delete/Drag) */}
                                                        <div className={`absolute right-0 -top-8 bg-brand-orange text-white rounded-t-md px-2 py-1 flex gap-2 items-center text-xs ${activeSection?.id === section.id ? 'flex' : 'hidden'}`}>
                                                            <div {...provided.dragHandleProps} className="cursor-grab hover:text-white/80"><GripVertical size={14}/></div>
                                                            <div className="w-[1px] h-3 bg-white/30"></div>
                                                            <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} className="hover:text-red-200"><Trash2 size={14}/></button>
                                                        </div>

                                                        {/* Render Preview */}
                                                        <PreviewComponent section={section} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {sections.length === 0 && (
                                            <div className="p-10 flex flex-col items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-300 m-4 rounded-xl bg-white/50">
                                                <Smartphone size={24} className="mb-2 opacity-50"/>
                                                Kéo component hoặc click vào thư viện
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                         </DragDropContext>
                      </div>
                      
                      {/* Home Indicator */}
                      <div className="h-5 bg-white shrink-0 flex justify-center items-center"><div className="w-32 h-1 bg-gray-300 rounded-full"></div></div>
                 </div>
            </div>

            {/* 3. RIGHT PANEL: CONFIGURATION */}
            <div className="w-[320px] bg-white border-l flex flex-col h-full animate-in slide-in-from-right-10 shadow-lg z-20">
                {activeSection ? (
                    <>
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-800 truncate">Cấu hình {AVAILABLE_BLOCKS.find(b => b.type === activeSection.type)?.label}</h3>
                            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            
                            {/* Tiêu đề Section */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Tiêu đề Section (Nếu cần)</label>
                                <input 
                                    className="w-full text-sm border p-2 rounded focus:ring-1 focus:ring-brand-orange outline-none" 
                                    value={activeSection.title || ''} 
                                    onChange={(e) => updateActiveSection('title_root', e.target.value)}
                                    placeholder="VD: Sản phẩm mới..."
                                />
                            </div>

                            {/* --- Config: Banner Carousel --- */}
                            {activeSection.type === 'BANNER_CAROUSEL' && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-xs font-bold text-gray-500">Danh sách ảnh</label>
                                            {uploading && <span className="text-[10px] text-brand-orange animate-pulse">Đang tải...</span>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* List Image */}
                                            {activeSection.config.images?.map((img: string, idx: number) => (
                                                <div key={idx} className="relative aspect-video rounded border overflow-hidden group shadow-sm">
                                                    <Image src={img} alt="Banner" fill className="object-cover" />
                                                    <button 
                                                        onClick={() => {
                                                            const newImages = activeSection.config.images.filter((_:any, i:number) => i !== idx);
                                                            updateActiveSection('images', newImages);
                                                        }}
                                                        className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {/* Button Upload */}
                                            <label className="aspect-video border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-orange-50 transition text-gray-400 hover:text-brand-orange">
                                                <Upload size={18} className="mb-1"/>
                                                <span className="text-[10px] font-medium">Thêm ảnh</span>
                                                <input type="file" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Chiều cao (px)</label>
                                        <input type="number" className="w-full text-sm border p-2 rounded" value={activeSection.config.height} onChange={(e) => updateActiveSection('height', Number(e.target.value))} />
                                    </div>
                                </div>
                            )}

                            {/* --- Config: Product Highlight --- */}
                            {activeSection.type === 'PRODUCT_HIGHLIGHT' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Chế độ hiển thị</label>
                                        <select className="w-full text-sm border p-2 rounded focus:ring-1 focus:ring-brand-orange" value={activeSection.config.type} onChange={(e) => updateActiveSection('type', e.target.value)}>
                                            <option value="auto">Tự động (Bán chạy nhất)</option>
                                            <option value="newest">Mới nhất</option>
                                            <option value="manual">Chọn thủ công</option>
                                        </select>
                                    </div>
                                    
                                    {activeSection.config.type === 'manual' && (
                                        <div className="bg-orange-50 p-3 rounded border border-orange-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-bold text-gray-700">Sản phẩm ({activeSection.config.productIds?.length || 0})</span>
                                                <button onClick={openProductModal} className="text-xs bg-white border border-brand-orange/30 text-brand-orange px-2 py-1 rounded shadow-sm hover:bg-brand-orange hover:text-white transition">
                                                    + Chọn SP
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                                {activeSection.config.productIds?.length > 0 ? activeSection.config.productIds.map((id: string) => (
                                                    <span key={id} className="text-[10px] bg-white border px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                        {id.slice(0,6)}... <button onClick={() => toggleProductSelection(id)} className="hover:text-red-500"><X size={10}/></button>
                                                    </span>
                                                )) : (
                                                    <span className="text-[10px] text-gray-400 italic">Chưa chọn sản phẩm nào</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Số lượng hiển thị</label>
                                        <input type="number" max={12} className="w-full text-sm border p-2 rounded" value={activeSection.config.limit} onChange={(e) => updateActiveSection('limit', Number(e.target.value))} />
                                    </div>
                                </div>
                            )}
                            
                            {/* --- Config: Video --- */}
                            {activeSection.type === 'VIDEO' && (
                                <div className="space-y-4">
                                     <div>
                                         <label className="text-xs font-bold text-gray-500 mb-1 block">Youtube URL</label>
                                         <input 
                                            className="w-full text-sm border p-2 rounded" 
                                            value={activeSection.config.url} 
                                            onChange={(e) => updateActiveSection('url', e.target.value)} 
                                            placeholder="https://youtube.com/..."
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-gray-500 mb-2 block">Ảnh bìa (Thumbnail)</label>
                                         <div className="relative aspect-video bg-gray-100 rounded border overflow-hidden mb-2 group">
                                             {activeSection.config.cover ? (
                                                 <Image src={activeSection.config.cover} alt="Cover" fill className="object-cover" />
                                             ) : (
                                                 <div className="flex items-center justify-center h-full text-gray-400 text-xs">Chưa có ảnh</div>
                                             )}
                                             
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                 <label className="cursor-pointer px-3 py-1.5 bg-white rounded-md text-xs font-medium hover:bg-gray-100">
                                                     Thay ảnh
                                                     <input type="file" onChange={(e) => handleImageUpload(e, 'video_cover')} className="hidden" accept="image/*" />
                                                 </label>
                                             </div>
                                         </div>
                                         {!activeSection.config.cover && (
                                            <label className="block text-center w-full py-2 text-xs border border-dashed rounded cursor-pointer hover:bg-gray-50">
                                                Tải ảnh lên
                                                <input type="file" onChange={(e) => handleImageUpload(e, 'video_cover')} className="hidden" accept="image/*" />
                                            </label>
                                         )}
                                     </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-white">
                        <Smartphone size={48} className="mb-4 opacity-10" />
                        <p className="text-sm font-medium">Chọn một khối trên màn hình thiết kế để chỉnh sửa.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- MODAL: CHỌN SẢN PHẨM --- */}
        {showProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Chọn sản phẩm</h3>
                        <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                        {modalLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Loader2 className="animate-spin mb-2" size={24}/>
                                <span className="text-sm">Đang tải danh sách...</span>
                            </div>
                        ) : sellerProducts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>Shop chưa có sản phẩm nào.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sellerProducts.map(p => {
                                    const isSelected = activeSection?.config.productIds?.includes(p.id);
                                    const imgUrl = getImageUrl(p.images);
                                    return (
                                        <div 
                                            key={p.id} 
                                            onClick={() => toggleProductSelection(p.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-orange border-brand-orange' : 'bg-white border-gray-300'}`}>
                                                {isSelected && <Check size={12} className="text-white"/>}
                                            </div>
                                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden relative shrink-0">
                                                <Image src={imgUrl} alt={p.name} fill className="object-cover"/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                                                <p className="text-xs text-brand-orange font-bold">{p.price?.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                        <button onClick={() => setShowProductModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Đóng</button>
                        <button onClick={() => setShowProductModal(false)} className="px-6 py-2 bg-brand-orange text-white text-sm font-bold rounded shadow hover:bg-orange-600">
                            Xong ({activeSection?.config.productIds?.length || 0})
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

// --- PREVIEW COMPONENT ---
const PreviewComponent = ({ section }: { section: ShopSection }) => {
    switch (section.type) {
        case 'BANNER_CAROUSEL':
            return (
                <div className="w-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden relative" style={{ height: section.config.height || 150 }}>
                    {section.config.images?.length > 0 ? (
                        <img src={section.config.images[0]} className="w-full h-full object-cover" alt="Banner" />
                    ) : (
                        <span className="text-xs">Banner ({section.config.height}px)</span>
                    )}
                    {section.config.images?.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                            {section.config.images.map((_:any, i:number) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===0 ? 'bg-white':'bg-white/50'}`}></div>)}
                        </div>
                    )}
                </div>
            );
        case 'PRODUCT_HIGHLIGHT':
            return (
                <div className="p-3 bg-white mb-2">
                    {section.title && <h4 className="font-bold text-sm mb-2 text-gray-800 uppercase border-l-2 border-brand-orange pl-2">{section.title}</h4>}
                    <div className="grid grid-cols-2 gap-2">
                        {[...Array(Math.min(section.config.limit || 4, 4))].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-gray-50 rounded border border-gray-100 flex flex-col">
                                <div className="flex-1 bg-gray-200 m-1 rounded-sm"></div>
                                <div className="h-2 w-3/4 bg-gray-200 m-1 rounded-sm"></div>
                                <div className="h-2 w-1/2 bg-gray-200 m-1 mb-2 rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'VIDEO':
            return (
                <div className="w-full aspect-video bg-black flex items-center justify-center text-white mb-2 relative">
                    {section.config.cover && <img src={section.config.cover} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />}
                    <PlayCircle size={32} className="relative z-10"/>
                </div>
            );
        case 'VOUCHER_LIST':
             return (
                 <div className="p-3 bg-white mb-2 flex gap-2 overflow-hidden">
                     <div className="w-32 h-12 bg-orange-50 border border-dashed border-orange-300 rounded shrink-0 relative flex items-center justify-center">
                         <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-orange-300"></div>
                         <span className="text-[10px] text-brand-orange font-bold">GIAM 50K</span>
                     </div>
                     <div className="w-32 h-12 bg-orange-50 border border-dashed border-orange-300 rounded shrink-0 relative flex items-center justify-center">
                         <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-orange-300"></div>
                          <span className="text-[10px] text-brand-orange font-bold">FREESHIP</span>
                     </div>
                 </div>
             )
        default: return null;
    }
}