'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { ShopService } from '@/services/shop.service';
import { FiSearch, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess: () => void;
}

const ProductSelectionModal = ({ isOpen, onClose, categoryId, onSuccess }: ProductSelectionModalProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Lấy danh sách sản phẩm của Shop để chọn
      const res: any = await ShopService.getSellerProducts({
        page: 1,
        limit: 20,
        keyword: debouncedSearch
      });
      if (res) {
        setProducts(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (isOpen) fetchProducts();
  }, [isOpen, fetchProducts]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      await ShopService.addProductsToCategory(categoryId, selectedIds);
      onSuccess();
      onClose();
      setSelectedIds([]);
    } catch (error) {
      alert('Lỗi khi thêm sản phẩm');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-[600px] h-[80vh] flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Thêm sản phẩm vào danh mục</h3>
          <button onClick={onClose}><FiX size={24} /></button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:border-brand-orange outline-none"
              placeholder="Tìm tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <p className="text-center text-gray-500 mt-5">Đang tải...</p>
          ) : products.length === 0 ? (
             <p className="text-center text-gray-500 mt-5">Không tìm thấy sản phẩm nào</p>
          ) : (
            products.map((product) => (
              <div 
                key={product.id} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedIds.includes(product.id) ? 'border-brand-orange bg-orange-50' : 'hover:bg-gray-50'}`}
                onClick={() => toggleSelect(product.id)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedIds.includes(product.id) ? 'bg-brand-orange border-brand-orange' : 'border-gray-300'}`}>
                  {selectedIds.includes(product.id) && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="w-12 h-12 relative border rounded bg-gray-100 flex-shrink-0">
                  {product.images?.[0] && (
                    <Image src={product.images[0]} alt="" fill className="object-cover rounded" />
                  )}
                </div>
                <div className="flex-1">
                   <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                   <p className="text-xs text-gray-500">Đã bán: {product.salesCount || 0}</p>
                   {/* Hiển thị nếu SP đã thuộc danh mục khác (Optional) */}
                   {product.shopCategoryId && product.shopCategoryId !== categoryId && (
                     <span className="text-[10px] text-red-500 bg-red-50 px-1 rounded">Đang thuộc danh mục khác</span>
                   )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={selectedIds.length === 0}>
            Xác nhận ({selectedIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;