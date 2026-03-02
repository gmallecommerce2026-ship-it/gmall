// src/modules/seller/products/components/FlashSaleProductSelector.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { ShopService } from '@/services/shop.service';
import { Search, X, Check, ChevronDown, ChevronRight, Box, Circle } from 'lucide-react'; // Bổ sung icon
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';

interface FlashSaleProductSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (products: any[]) => void;
  excludeIds?: string[]; // Danh sách productId đã chọn (để disable hoặc filter)
}

const FlashSaleProductSelector = ({ isOpen, onClose, onConfirm, excludeIds = [] }: FlashSaleProductSelectorProps) => {
  const [products, setProducts] = useState<any[]>([]);
  // Lưu danh sách variantId đã chọn. Set giúp thao tác check/uncheck O(1)
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());
  // Lưu danh sách productId được expand để xem variant
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());
  
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (isOpen) {
        fetchProducts();
        setSelectedVariantIds(new Set()); // Reset khi mở lại
        setExpandedProductIds(new Set());
    }
  }, [isOpen, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // API cần đảm bảo trả về cả relation 'variants'
      const res: any = await ShopService.getSellerProducts({ 
        page: 1, 
        limit: 20, 
        keyword: debouncedSearch 
      });
      
      const data = res.data || (Array.isArray(res) ? res : []);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle xem danh sách phân loại
  const toggleExpand = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setExpandedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Chọn 1 variant cụ thể
  const toggleVariant = (variantId: string) => {
    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  // Chọn cả sản phẩm (tất cả variants của nó)
  const toggleProductAll = (product: any) => {
    const variants = product.variants || [];
    // Nếu là simple product (không có variants), dùng ID chính nó làm variantId (hoặc logic riêng của bạn)
    const allVariantIds = variants.length > 0 
        ? variants.map((v: any) => v.id) 
        : [product.id];

    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      // Kiểm tra xem đã chọn hết chưa
      const isAllSelected = allVariantIds.every((id: string) => prev.has(id));

      if (isAllSelected) {
        // Bỏ chọn tất cả
        allVariantIds.forEach((id: string) => next.delete(id));
      } else {
        // Chọn tất cả
        allVariantIds.forEach((id: string) => next.add(id));
      }
      return next;
    });
  };

  const handleConfirm = () => {
    // Logic quan trọng: Map lại cấu trúc để trả về parent product chứa variants đã chọn
    const result = products.filter(p => {
        const variants = p.variants || [];
        
        // Case 1: Simple Product (Không variants)
        if (variants.length === 0) {
            return selectedVariantIds.has(p.id);
        }

        // Case 2: Configurable Product (Có variants)
        // Chỉ trả về product nếu có ít nhất 1 variant được chọn
        const hasSelectedVariant = variants.some((v: any) => selectedVariantIds.has(v.id));
        return hasSelectedVariant;
    }).map(p => {
        // Clone product để không ảnh hưởng state gốc
        const clone = { ...p };
        
        // Filter chỉ giữ lại variants được chọn
        if (clone.variants && clone.variants.length > 0) {
            clone.variants = clone.variants.filter((v: any) => selectedVariantIds.has(v.id));
        }
        return clone;
    });

    onConfirm(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl w-[800px] h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Chọn sản phẩm / Phân loại</h3>
            <p className="text-sm text-gray-500">Tích chọn các mẫu bạn muốn tham gia Flash Sale</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          ) : products.length === 0 ? (
             <div className="text-center text-gray-500 mt-10">Không tìm thấy sản phẩm nào</div>
          ) : (
            products.map((product) => {
                const variants = product.variants || [];
                const isSimple = variants.length === 0;
                
                // Logic check state cho Parent Checkbox
                const relevantIds = isSimple ? [product.id] : variants.map((v: any) => v.id);
                const checkedCount = relevantIds.filter((id: string) => selectedVariantIds.has(id)).length;
                const isAllChecked = checkedCount === relevantIds.length && relevantIds.length > 0;
                const isIndeterminate = checkedCount > 0 && !isAllChecked;

                const isExpanded = expandedProductIds.has(product.id);
                
                // Image handling
                const imgUrl = Array.isArray(product.images) 
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) 
                    : (product.image || '/placeholder.png');

                return (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Parent Row (Product) */}
                    <div 
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer select-none"
                        onClick={() => !isSimple && toggleExpand({ stopPropagation: () => {} } as any, product.id)}
                    >
                        {/* Checkbox Parent */}
                        <div 
                            onClick={(e) => { e.stopPropagation(); toggleProductAll(product); }}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                isAllChecked ? 'bg-blue-600 border-blue-600' : 
                                isIndeterminate ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                            }`}
                        >
                             {isAllChecked && <Check size={14} className="text-white" />}
                             {isIndeterminate && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
                        </div>

                        {/* Image */}
                        <div className="w-12 h-12 relative border rounded bg-gray-100 flex-shrink-0">
                             <Image src={imgUrl} alt="" fill className="object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                            <div className="text-xs text-gray-500 flex gap-2">
                                <span>Kho: {product.stock}</span>
                                {variants.length > 0 && <span className="text-blue-600 font-medium">• {variants.length} phân loại</span>}
                            </div>
                        </div>

                        {/* Expand Button */}
                        {!isSimple && (
                            <button 
                                onClick={(e) => toggleExpand(e, product.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            >
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                        )}
                    </div>

                    {/* Children Rows (Variants) */}
                    {isExpanded && !isSimple && (
                        <div className="border-t border-gray-100 bg-gray-50/50">
                            {variants.map((variant: any) => {
                                const isChecked = selectedVariantIds.has(variant.id);
                                return (
                                    <div 
                                        key={variant.id} 
                                        onClick={() => toggleVariant(variant.id)}
                                        className="flex items-center gap-3 p-2 pl-12 hover:bg-blue-50/30 cursor-pointer border-b last:border-0 border-gray-100 border-dashed"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                            isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                                        }`}>
                                            {isChecked && <Check size={12} className="text-white" />}
                                        </div>
                                        
                                        <div className="flex-1 text-sm text-gray-700 flex justify-between pr-4">
                                            <span className="font-medium">{variant.name || variant.title}</span>
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span>Giá: {new Intl.NumberFormat('vi-VN').format(variant.price)}đ</span>
                                                <span>Kho: {variant.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                  </div>
                );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <span className="text-sm font-medium text-gray-600">
                Đã chọn: <b className="text-blue-600">{selectedVariantIds.size}</b> phân loại
            </span>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
                <Button onClick={handleConfirm} disabled={selectedVariantIds.size === 0} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    Xác nhận
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleProductSelector;