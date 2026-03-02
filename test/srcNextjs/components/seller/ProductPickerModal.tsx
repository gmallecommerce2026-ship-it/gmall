'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX, FiCheck, FiFilter, FiPackage } from 'react-icons/fi';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { ShopService } from '@/services/shop.service'; // Giả định service này đã có
import Button from '@/components/ui/Button'; // Sử dụng Button UI có sẵn của bạn

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  stock?: number;
  salesCount?: number;
}

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedIds: string[];
  onConfirm: (products: Product[]) => void;
}

export default function ProductPickerModal({ isOpen, onClose, initialSelectedIds, onConfirm }: ProductPickerModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [selectedProductsMap, setSelectedProductsMap] = useState<Map<string, Product>>(new Map()); // Lưu full object để trả về
  
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const debouncedSearch = useDebounce(search, 500);

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initialSelectedIds));
      setPage(1);
      fetchProducts(1, debouncedSearch, true);
    }
  }, [isOpen]);

  // Fetch khi search thay đổi
  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    fetchProducts(1, debouncedSearch, true);
  }, [debouncedSearch]);

  const fetchProducts = async (currentPage: number, keyword: string, isReset: boolean) => {
    setLoading(true);
    try {
      // Gọi API lấy sản phẩm (Pagination)
      const res: any = await ShopService.getSellerProducts({ 
        page: currentPage, 
        limit: 20, 
        keyword: keyword 
      });

      // Giả sử res trả về mảng sản phẩm trực tiếp hoặc res.data
      const newProducts = Array.isArray(res) ? res : res.data || [];
      
      if (isReset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === 20); // Nếu trả về đủ limit thì còn trang sau
    } catch (error) {
      console.error("Lỗi tải sản phẩm", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, debouncedSearch, false);
  };

  const toggleSelect = (product: Product) => {
    const newSet = new Set(selectedIds);
    const newMap = new Map(selectedProductsMap);

    if (newSet.has(product.id)) {
      newSet.delete(product.id);
      newMap.delete(product.id);
    } else {
      newSet.add(product.id);
      newMap.set(product.id, product);
    }
    
    setSelectedIds(newSet);
    setSelectedProductsMap(newMap);
  };

  const handleConfirm = () => {
    // Kết hợp các sản phẩm đang có trong Map và Products hiện tại để trả về
    // Logic: Nếu user search -> chọn A, sau đó search -> chọn B. Cần trả về cả A và B.
    // Map giúp lưu trữ các sản phẩm đã chọn dù nó không hiển thị ở list hiện tại (do search filter)
    
    // Cập nhật map với những item trong list hiện tại đang được select
    const finalProducts: Product[] = [];
    
    // Ưu tiên lấy từ products list hiện tại để đảm bảo data mới nhất, 
    // nếu không có (do đang ở page khác) thì thôi (vì logic cha sẽ handle việc fetch lại nếu cần, hoặc ta truyền full object)
    
    // Ở đây ta trả về danh sách ID, nhưng tốt hơn là trả về object để hiển thị preview
    // Ta cần merge products hiện tại vào map selected để đảm bảo có đủ info
    products.forEach(p => {
      if (selectedIds.has(p.id)) {
        selectedProductsMap.set(p.id, p);
      }
    });

    onConfirm(Array.from(selectedProductsMap.values()));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-[800px] h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-xl text-gray-800">Chọn Sản Phẩm</h3>
            <p className="text-sm text-gray-500 mt-1">Đã chọn: <span className="font-bold text-blue-600">{selectedIds.size}</span> sản phẩm</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><FiX size={24} /></button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-white flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
              value={search}
              autoFocus
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Có thể thêm filter danh mục ở đây nếu muốn mở rộng */}
        </div>

        {/* List Products */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50 custom-scrollbar">
          {products.length === 0 && !loading ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiPackage size={48} className="mb-2 opacity-50"/>
                <p>Không tìm thấy sản phẩm phù hợp</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {products.map((product) => {
                const isSelected = selectedIds.has(product.id);
                return (
                  <div 
                    key={product.id} 
                    className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                    onClick={() => toggleSelect(product)}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <FiCheck className="text-white" size={16} />}
                    </div>
                    
                    <div className="w-14 h-14 relative border rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</p>
                       <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">Kho: {product.stock || 0}</span>
                          <span>Đã bán: {product.salesCount || 0}</span>
                       </div>
                    </div>
                    
                    <div className="text-right font-medium text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && products.length > 0 && (
            <div className="p-4 text-center">
                <button 
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="text-blue-600 text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {loading ? 'Đang tải thêm...' : 'Xem thêm sản phẩm'}
                </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-white flex justify-between items-center">
            <div className="text-sm text-gray-600">
                {selectedIds.size > 0 ? (
                    <span>Đang chọn <b className="text-blue-600">{selectedIds.size}</b> sản phẩm</span>
                ) : (
                    <span>Chưa chọn sản phẩm nào</span>
                )}
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} type="button">Hủy bỏ</Button>
                <Button onClick={handleConfirm} disabled={selectedIds.size === 0} type="button">
                    Xác nhận thêm
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}