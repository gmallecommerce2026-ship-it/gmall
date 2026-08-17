import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Check } from 'lucide-react';
import { api } from '@/services/api'; // Sử dụng instance api của bạn
import Image from 'next/image';

interface ProductCompact {
    id: string;
    name: string;
    images: string[];
    price: number;
}

interface CrossSellSelectorProps {
    currentProductId?: string; // Để loại trừ chính nó
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export const CrossSellSelector: React.FC<CrossSellSelectorProps> = ({ currentProductId, selectedIds, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ProductCompact[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<ProductCompact[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Tìm kiếm sản phẩm của shop
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // Gọi API search product của seller (cần đảm bảo BE có API này)
                const res = await api.get('/seller/products/my-products', { 
                    params: { search: searchTerm, limit: 5 } 
                });
                // [FIX wiki 0095/0099/0103] `(res.data || res || [])` ném TypeError nếu response
                // là `null`/`undefined`, và nếu response là object thiếu khoá `data` thì rơi về
                // chính object đó → `.filter is not a function`. Chuẩn hoá về mảng trước khi lọc.
                const rows = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
                // Filter bỏ sản phẩm hiện tại và sản phẩm đã chọn
                const list = (Array.isArray(rows) ? rows : []).filter((p: any) =>
                    p.id !== currentProductId && !selectedIds.includes(p.id)
                );
                
                // Map data cho đúng format UI
                setSearchResults(list.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    images: Array.isArray(p.images) ? p.images.map((i:any) => i.url || i) : []
                })));
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, currentProductId, selectedIds]);

    // Handle chọn
    const handleSelect = (product: ProductCompact) => {
        setSelectedProducts([...selectedProducts, product]);
        onChange([...selectedIds, product.id]);
        setSearchResults([]); // Clear search
        setSearchTerm('');
    };

    // Handle xóa
    const handleRemove = (id: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== id));
        onChange(selectedIds.filter(pid => pid !== id));
    };

    return (
        <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 outline-none"
                    placeholder="Tìm tên sản phẩm để thêm vào combo..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(p => (
                            <div key={p.id} 
                                onClick={() => handleSelect(p)}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                            >
                                <div className="w-10 h-10 relative border rounded bg-gray-100 shrink-0">
                                    {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover rounded"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{p.name}</p>
                                    <p className="text-xs text-orange-600 font-bold">{p.price.toLocaleString()}₫</p>
                                </div>
                                <Plus size={16} className="text-gray-400" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected List */}
            {selectedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProducts.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 border rounded-lg bg-orange-50/30 border-orange-100">
                             <div className="w-12 h-12 relative border rounded bg-white shrink-0">
                                {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover rounded"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                                <p className="text-xs text-gray-500">ID: ...{p.id.slice(-6)}</p>
                            </div>
                            <button onClick={() => handleRemove(p.id)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg text-gray-400 text-sm">
                    Chưa có sản phẩm mua kèm nào được chọn
                </div>
            )}
        </div>
    );
};