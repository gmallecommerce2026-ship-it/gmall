'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ProductService } from '@/services/product.service';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

const MiniVariantSelector = ({ label, options, selected, onSelect }: any) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-gray-500 w-8">{label}:</span>
    <div className="relative group">
        <button className="border border-gray-300 rounded px-2 py-1 bg-white flex items-center gap-1 min-w-[60px] justify-between hover:border-orange-500">
            <span className="truncate">{selected || 'Chọn'}</span>
            <ChevronDown size={10} />
        </button>
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
                    
                    const initialSelections: any = {};
                    data.forEach((p: any) => {
                        const productSelection: any = {};
                        // Kiểm tra kỹ options trước khi map
                        if (p.options && Array.isArray(p.options)) {
                            p.options.forEach((opt: any) => {
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
    if (id === mainProduct.id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddAllToCart = async () => {
      setIsAdding(true);
      try {
          // Logic thêm vào giỏ hàng
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
        <div className="flex-1 overflow-x-auto pb-2">
            <div className="flex items-start gap-3 min-w-max">
            
                {/* 1. Main Product */}
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

                <div className="h-32 flex items-center justify-center text-gray-300">
                    <Plus size={24} />
                </div>

                {/* 2. Related Products */}
                {relatedProducts.map((product) => (
                    <div key={product.id} className="flex items-start gap-3">
                        <div className="w-44 shrink-0 relative group">
                            <div 
                                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${selectedIds.includes(product.id) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}
                                onClick={() => handleToggle(product.id)}
                            >
                                {selectedIds.includes(product.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>

                            <div className="aspect-square relative rounded-md overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                                <img 
                                    // Xử lý ảnh an toàn: string hoặc object
                                    src={product.images && product.images[0] ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : '/placeholder.png'} 
                                    alt={product.name} 
                                    className={`object-cover w-full h-full transition-opacity ${!selectedIds.includes(product.id) ? 'opacity-50 grayscale' : ''}`}
                                />
                            </div>
                            
                            <p className="text-xs font-medium line-clamp-2 h-8 mb-1 hover:text-orange-600 cursor-pointer">{product.name}</p>
                            <p className="text-brand-orange font-bold text-sm mb-2">{formatCurrency(Number(product.price))}</p>

                            {/* Chỉ hiển thị selector nếu có options */}
                            {selectedIds.includes(product.id) && product.options && product.options.length > 0 && (
                                <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
                                    {product.options.map((opt: any) => (
                                        <MiniVariantSelector 
                                            key={opt.id || opt.name}
                                            label={opt.name}
                                            options={opt.values.map((v:any) => v.value)}
                                            selected={selections[product.id]?.[opt.name]}
                                            onSelect={(val: string) => handleVariantChange(product.id, opt.name, val)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {product.id !== relatedProducts[relatedProducts.length - 1].id && (
                             <div className="h-32 flex items-center justify-center text-gray-300">
                                <Plus size={24} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

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