'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ProductService } from '@/services/product.service';
import { useCartStore } from '@/store/useCartStore'; // Import store giỏ hàng
import toast from 'react-hot-toast';

// Helper component: Dropdown chọn phân loại (Size/Màu) nhỏ gọn
const MiniVariantSelector = ({ label, options, selected, onSelect }: any) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-gray-500 w-8">{label}:</span>
    <div className="relative group">
        <button className="border border-gray-300 rounded px-2 py-1 bg-white flex items-center gap-1 min-w-[60px] justify-between hover:border-orange-500">
            <span className="truncate">{selected || 'Chọn'}</span>
            <ChevronDown size={10} />
        </button>
        {/* Dropdown content */}
        <div className="absolute top-full left-0 mt-1 w-max min-w-full bg-white border border-gray-200 shadow-lg rounded-md z-20 hidden group-hover:block max-h-40 overflow-y-auto">
            {options.map((opt: string) => (
                <div 
                    key={opt} 
                    className={`px-3 py-1.5 cursor-pointer hover:bg-orange-50 hover:text-orange-600 ${selected === opt ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-700'}`}
                    onClick={() => onSelect(opt)}
                >
                    {opt}
                </div>
            ))}
        </div>
    </div>
  </div>
);

interface BoughtTogetherProps {
  mainProduct: any;
}

export const BoughtTogether: React.FC<BoughtTogetherProps> = ({ mainProduct }) => {
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // State lưu lựa chọn phân loại của từng sản phẩm kèm theo: { [productId]: { Size: 'L', Color: 'Red' } }
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>({});
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (mainProduct?.id) {
        setSelectedIds([mainProduct.id]);
        const fetchBoughtTogether = async () => {
            try {
                const data = await ProductService.getBoughtTogether(mainProduct.id);
                if (Array.isArray(data) && data.length > 0) {
                    setRelatedProducts(data);
                    setSelectedIds((prev) => [...prev, ...data.map((p: any) => p.id)]);
                    
                    // Khởi tạo lựa chọn mặc định (lấy option đầu tiên) cho mỗi sản phẩm
                    const initialSelections: any = {};
                    data.forEach((p: any) => {
                        const productSelection: any = {};
                        if (p.options && Array.isArray(p.options)) {
                            p.options.forEach((opt: any) => {
                                // Lấy value đầu tiên của option làm mặc định
                                if (opt.values && opt.values.length > 0) {
                                    productSelection[opt.name] = opt.values[0].value;
                                }
                            });
                        }
                        initialSelections[p.id] = productSelection;
                    });
                    setSelections(initialSelections);
                }
            } catch (error) {
                console.error('Failed to load bought together products', error);
            }
        };
        fetchBoughtTogether();
    }
  }, [mainProduct]);

  // Xử lý chọn biến thể
  const handleVariantChange = (productId: string, optionName: string, value: string) => {
      setSelections(prev => ({
          ...prev,
          [productId]: {
              ...prev[productId],
              [optionName]: value
          }
      }));
  };

  const handleToggle = (id: string) => {
    if (id === mainProduct.id) return; // Không cho bỏ chọn sản phẩm chính
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddAllToCart = async () => {
      setIsAdding(true);
      try {
          // 1. Thêm sản phẩm chính (Sử dụng state selected variant từ trang cha nếu có, ở đây giả sử main product đã được chọn từ ProductInfo)
        // ....
          toast.success("Đã thêm combo vào giỏ hàng!");
      } catch (e) {
          toast.error("Có lỗi xảy ra");
      } finally {
          setIsAdding(false);
      }
  };

  const { totalPrice, totalSavings, totalItems } = useMemo(() => {
    const allItems = [mainProduct, ...relatedProducts];
    const selectedItems = allItems.filter((p) => p && selectedIds.includes(p.id));
    
    // Giả lập logic giảm giá Combo: Giảm 5% nếu mua >= 2 món
    const isCombo = selectedItems.length >= 2;
    const discountRate = isCombo ? 0.05 : 0;

    const rawTotal = selectedItems.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const finalTotal = rawTotal * (1 - discountRate);
    
    return {
      totalPrice: finalTotal,
      totalSavings: rawTotal * discountRate,
      totalItems: selectedItems.length
    };
  }, [mainProduct, relatedProducts, selectedIds]);
  console.log("mainProduct ", mainProduct);
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-lg border border-orange-100 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Thường được mua cùng</h3>
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
              Mua kèm để tiết kiệm thêm phí vận chuyển!
          </span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* List sản phẩm */}
        <div className="flex-1 overflow-x-auto pb-2">
            <div className="flex items-start gap-3 min-w-max">
            
                {/* 1. Sản phẩm chính */}
                <div className="w-40 shrink-0">
                    <div className="aspect-square relative rounded-md overflow-hidden border border-orange-500 bg-gray-50 mb-2">
                        <img 
                            src={mainProduct.imageUrl || '/placeholder.png'} 
                            alt={mainProduct.name} 
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-0 w-full bg-orange-500 text-white text-[10px] text-center py-0.5 font-bold">
                            Đang xem
                        </div>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 h-8 mb-1" title={mainProduct.name}>{mainProduct.name}</p>
                    <p className="text-brand-orange font-bold text-sm">{formatCurrency(Number(mainProduct.price))}</p>
                </div>

                {/* Dấu cộng */}
                <div className="h-32 flex items-center justify-center text-gray-300">
                    <Plus size={24} />
                </div>

                {/* 2. Danh sách sản phẩm mua kèm */}
                {relatedProducts.map((product) => (
                    <div key={product.id} className="flex items-start gap-3">
                        <div className="w-44 shrink-0 relative group">
                            {/* Checkbox to select */}
                            <div 
                                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${selectedIds.includes(product.id) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}
                                onClick={() => handleToggle(product.id)}
                            >
                                {selectedIds.includes(product.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>

                            <div className="aspect-square relative rounded-md overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                                <img 
                                    src={product.images[0] || '/placeholder.png'} 
                                    alt={product.name} 
                                    className={`object-cover w-full h-full transition-opacity ${!selectedIds.includes(product.id) ? 'opacity-50 grayscale' : ''}`}
                                />
                            </div>
                            
                            <p className="text-xs font-medium line-clamp-2 h-8 mb-1 hover:text-orange-600 cursor-pointer">{product.name}</p>
                            <p className="text-brand-orange font-bold text-sm mb-2">{formatCurrency(Number(product.price))}</p>

                            {/* --- [NEW] Variant Selector --- */}
                            {selectedIds.includes(product.id) && product.options && (
                                <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
                                    {product.options.map((opt: any) => (
                                        <MiniVariantSelector 
                                            key={opt.id}
                                            label={opt.name}
                                            options={opt.values.map((v:any) => v.value)}
                                            selected={selections[product.id]?.[opt.name]}
                                            onSelect={(val: string) => handleVariantChange(product.id, opt.name, val)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Dấu cộng nối tiếp (nếu không phải phần tử cuối) */}
                        {product.id !== relatedProducts[relatedProducts.length - 1].id && (
                             <div className="h-32 flex items-center justify-center text-gray-300">
                                <Plus size={24} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Tổng kết (Sticky Right) */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col justify-center border-l border-dashed border-gray-200 pl-6 lg:ml-0">
          <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                  <span>Tổng tiền ({totalItems} món):</span>
              </div>
              <div className="text-2xl font-extrabold text-brand-orange">
                {formatCurrency(totalPrice)}
              </div>
              
              {totalSavings > 0 && (
                <div className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold mt-1">
                   <span>Tiết kiệm {formatCurrency(totalSavings)}</span>
                </div>
              )}
          </div>
          
          <Button 
            variant="primary" 
            className="w-full font-bold shadow-lg shadow-orange-200 py-3 text-sm"
            onClick={handleAddAllToCart}
            disabled={isAdding}
          >
            {isAdding ? 'Đang xử lý...' : `Mua ${totalItems} sản phẩm`}
          </Button>
        </div>
      </div>
    </div>
  );
};