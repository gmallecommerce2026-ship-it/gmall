'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/ApiClient';
import { Search, Check, Store, Loader2, Package, ChevronDown, X } from 'lucide-react'; // Thêm icon X
import { useDebounce } from '@/hooks/useDebounce';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  sku?: string;
  // Bổ sung optional shop cho trường hợp fetch full
  shop?: {
    id: string;
    name: string;
  }
}

// Interface riêng cho sản phẩm đã chọn để đảm bảo luôn có tên Shop
interface SelectedProduct extends Product {
    shopName: string;
    shopId: string;
}

interface Shop {
  id: string;
  name: string;
  avatar?: string;
}

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  shopId?: string;                   
  onShopChange?: (id: string) => void;
}

export default function ProductSelector({ selectedIds, onChange, shopId, onShopChange }: Props) {
  // --- STATE ---
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [internalShopId, setInternalShopId] = useState<string>(shopId || '');

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  
  // [NEW] State lưu chi tiết sản phẩm đã chọn để hiển thị ở ScrollView
  const [selectedDetails, setSelectedDetails] = useState<SelectedProduct[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  // --- 1. SYNC & INIT ---
  useEffect(() => {
    if (shopId) setInternalShopId(shopId);
  }, [shopId]);

  // [NEW] Fetch chi tiết sản phẩm cũ khi mới mount (để hiển thị đúng shop của các ID đã lưu từ trước)
  useEffect(() => {
    if (selectedIds.length > 0 && selectedDetails.length === 0) {
        const fetchExistingDetails = async () => {
            setLoadingDetails(true);
            try {
                // Giả lập: Gọi API lấy chi tiết nhiều sản phẩm theo ID
                // Thực tế bạn cần endpoint: POST /products/get-by-ids { ids: [...] } trả về kèm thông tin shop
                // Ở đây tôi dùng tạm endpoint giả định
                const res = await apiClient.post('/admin/products/get-by-ids', { ids: selectedIds });
                const items = res.data || [];
                
                // Map data trả về vào state (Đảm bảo BE trả về object có relation shop)
                const mappedItems = items.map((p: any) => ({
                    ...p,
                    shopName: p.shop?.name || 'Unknown Shop',
                    shopId: p.shop?.id || ''
                }));
                setSelectedDetails(mappedItems);
            } catch (e) {
                console.error("Không thể tải chi tiết sản phẩm cũ", e);
            } finally {
                setLoadingDetails(false);
            }
        };
        fetchExistingDetails();
    }
  }, []); // Chỉ chạy 1 lần khi mount

  // --- 2. FETCH SHOPS ---
  useEffect(() => {
    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const res = await apiClient.get('/shops', { params: { limit: 100 } }); 
        const items = Array.isArray(res?.data) ? res.data : (res?.items || []);
        setShops(items);
        
        if (!shopId && !internalShopId && items.length > 0) {
          const firstShopId = items[0].id;
          setInternalShopId(firstShopId);
          if (onShopChange) onShopChange(firstShopId);
        }
      } catch (error) { console.error(error); } 
      finally { setLoadingShops(false); }
    };
    fetchShops();
  }, []);

  // --- 3. FETCH PRODUCTS ---
  useEffect(() => {
    if (!internalShopId) return;
    const fetchProducts = async () => {
      setLoadingProduct(true);
      try {
        const params: any = { limit: 20, page: 1, shopId: internalShopId };
        if (debouncedSearch) params.keyword = debouncedSearch;
        
        const res = await apiClient.get('/admin/products/selector', { params });
        const items = Array.isArray(res?.data) ? res.data : (res?.items || []);
        setProducts(items);
      } catch (error) { setProducts([]); } 
      finally { setLoadingProduct(false); }
    };
    fetchProducts();
  }, [debouncedSearch, internalShopId]);

  // --- HANDLERS ---
  const handleShopSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setInternalShopId(newId);
    if (onShopChange) onShopChange(newId);
  };

  const toggleProduct = (product: Product) => {
    const isSelected = selectedIds.includes(product.id);
    let newIds: string[] = [];
    let newDetails: SelectedProduct[] = [...selectedDetails];

    if (isSelected) {
        // REMOVE
        newIds = selectedIds.filter(pid => pid !== product.id);
        newDetails = newDetails.filter(p => p.id !== product.id);
    } else {
        // ADD
        newIds = [...selectedIds, product.id];
        
        // [IMPORTANT] Khi chọn, ta lấy luôn tên Shop hiện tại gán vào
        const currentShopName = shops.find(s => s.id === internalShopId)?.name || 'Unknown';
        newDetails.push({
            ...product,
            shopName: currentShopName,
            shopId: internalShopId
        });
    }

    onChange(newIds);
    setSelectedDetails(newDetails);
  };

  // Helper xóa nhanh từ thanh ScrollView bên dưới
  const removeProduct = (id: string) => {
      const newIds = selectedIds.filter(pid => pid !== id);
      const newDetails = selectedDetails.filter(p => p.id !== id);
      onChange(newIds);
      setSelectedDetails(newDetails);
  }

  const renderImage = (imgData: any) => {
    try {
      if (Array.isArray(imgData)) return imgData[0];
      if (typeof imgData === 'string' && imgData.startsWith('[')) return JSON.parse(imgData)[0];
      return imgData || '/placeholder.png';
    } catch (e) { return '/placeholder.png'; }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="p-3 border-b border-gray-100 bg-gray-50 space-y-3 shrink-0">
        <div className="relative">
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block flex items-center gap-1">
            <Store size={12} /> Chọn Cửa Hàng
          </label>
          <div className="relative">
            <select
              className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={internalShopId}
              onChange={handleShopSelect}
              disabled={loadingShops}
            >
              {loadingShops ? <option>Đang tải...</option> : null}
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- MAIN LIST (Scroll Vertical) --- */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
        {loadingProduct ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="animate-spin w-6 h-6" />
            <span className="text-xs">Đang tải sản phẩm...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Package className="w-8 h-8 opacity-50" />
            <span className="text-xs">
              {!internalShopId ? 'Vui lòng chọn Shop trước' : 'Không tìm thấy sản phẩm nào'}
            </span>
          </div>
        ) : (
          products.map(p => {
            const isSelected = selectedIds.includes(p.id);
            const imgUrl = renderImage(p.images);
            return (
              <div 
                key={p.id} 
                onClick={() => toggleProduct(p)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                  {isSelected && <Check className="text-white w-3.5 h-3.5" />}
                </div>
                <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                   <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>{p.name}</p>
                  <span className="text-xs font-medium text-orange-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- [NEW] SELECTED PRODUCTS SCROLLVIEW (Horizontal) --- */}
      {selectedDetails.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-3 shrink-0">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                      Đã chọn ({selectedDetails.length})
                  </span>
                  <button onClick={() => { onChange([]); setSelectedDetails([]); }} className="text-[10px] text-red-500 hover:underline">
                      Xóa tất cả
                  </button>
              </div>

              {/* Horizontal Scroll Area */}
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {selectedDetails.map((item) => (
                      <div key={item.id} className="relative group shrink-0 w-32 bg-white rounded-lg border border-gray-200 p-2 shadow-sm flex flex-col gap-1">
                          {/* Remove Button (Hover) */}
                          <button 
                             onClick={() => removeProduct(item.id)}
                             className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                          >
                              <X size={12} />
                          </button>

                          {/* Image */}
                          <div className="w-full h-20 rounded bg-gray-100 overflow-hidden border border-gray-100">
                              <img src={renderImage(item.images)} className="w-full h-full object-cover" alt="" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-700 truncate leading-tight mb-1" title={item.name}>
                                  {item.name}
                              </p>
                              
                              {/* Shop Badge */}
                              <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5 max-w-full">
                                  <Store size={8} className="text-gray-400 shrink-0" />
                                  <span className="text-[9px] text-gray-500 truncate" title={item.shopName}>
                                      {item.shopName}
                                  </span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}