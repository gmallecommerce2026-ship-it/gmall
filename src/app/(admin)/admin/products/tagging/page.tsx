// src/app/(admin)/admin/products/tagging/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api'; 
import { SystemTagSelector } from '@/components/seller/SystemTagSelector';
import { Save, Search, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  images: string[] | any; // Fix type any cho ảnh để tránh lỗi
  systemTags: string[];
  sku: string;
}

export default function ProductTaggingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // State quản lý tags đang chỉnh sửa { [productId]: tags[] }
  const [editingTags, setEditingTags] = useState<Record<string, string[]>>({});

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/products', {
        params: { limit: 50, search, status: 'ACTIVE' }
      });

      // [FIX] Kiểm tra cấu trúc response an toàn hơn
      // TH1: Axios response chuẩn -> res.data.data
      // TH2: Interceptor đã trả về body -> res.data
      const productsData = res?.data?.data || res?.data || [];

      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        console.error("API response format error:", res);
        setProducts([]);
      }

    } catch (error) {
      console.error(error);
      toast.error('Không tải được danh sách sản phẩm');
      setProducts([]); // Fallback array rỗng
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveTags = async (productId: string) => {
    const tags = editingTags[productId];
    if (!tags) return;

    try {
      await api.patch(`/admin/products/${productId}/system-tags`, {
        systemTags: tags
      });
      toast.success('Cập nhật tags thành công!');
      
      // Update local state
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, systemTags: tags } : p));
      
      // Clear editing state
      const newEditing = { ...editingTags };
      delete newEditing[productId];
      setEditingTags(newEditing);
    } catch (error) {
      toast.error('Lỗi cập nhật tags');
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-orange-500" /> Gán nhãn phân loại (Gift Tags)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các thẻ Người nhận, Dịp lễ cho sản phẩm quà tặng.</p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <input 
                    placeholder="Tìm tên, SKU..." 
                    className="border border-gray-300 pl-3 pr-10 py-2 rounded-lg text-sm w-[300px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchProducts()}
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button onClick={() => fetchProducts()} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                Tìm kiếm
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {loading ? (
           <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                      <th className="px-6 py-4 w-[30%]">Sản phẩm</th>
                      <th className="px-6 py-4 w-[60%]">Phân loại (Tags)</th>
                      <th className="px-6 py-4 text-right w-[10%]">Hành động</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {/* [FIX] Sử dụng Optional Chaining ?.map hoặc (products || []).map */}
                  {products && products.length > 0 ? (
                    products.map(product => {
                        // [FIX] Đảm bảo systemTags luôn là mảng (xử lý trường hợp DB trả về null/undefined)
                        const dbTags = Array.isArray(product.systemTags) ? product.systemTags : [];
                        const currentTags = editingTags[product.id] || dbTags;
                        const isDirty = editingTags[product.id] !== undefined;
                        
                        // [FIX] Xử lý hiển thị ảnh an toàn
                        const imgUrl = Array.isArray(product.images) ? product.images[0] : (product.images as any)?.url || '/placeholder.png';

                        return (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 align-top">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded border flex-shrink-0 overflow-hidden bg-gray-100">
                                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 line-clamp-2 mb-1" title={product.name}>{product.name}</p>
                                            <p className="text-xs text-gray-400 font-mono">SKU: {product.sku || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <SystemTagSelector 
                                        selectedTags={currentTags}
                                        onChange={(newTags) => {
                                            setEditingTags(prev => ({
                                                ...prev,
                                                [product.id]: newTags
                                            }));
                                        }}
                                    />
                                </td>
                                <td className="px-6 py-4 text-right align-top">
                                    {isDirty && (
                                        <button 
                                            onClick={() => handleSaveTags(product.id)}
                                            className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-700 shadow-sm transition-all animate-in fade-in zoom-in"
                                        >
                                            <Save size={14} /> Lưu
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })
                  ) : (
                    <tr>
                        <td colSpan={3} className="p-10 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                           <AlertCircle size={24} className="text-gray-300" />
                           <p>Không tìm thấy sản phẩm nào.</p>
                        </td>
                    </tr>
                  )}
              </tbody>
          </table>
        )}
      </div>
    </div>
  );
}