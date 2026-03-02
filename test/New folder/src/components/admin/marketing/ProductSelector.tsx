'use client';
import { useState, useEffect } from 'react';
import { apiClient }  from '@/lib/api/ApiClient'; // Đảm bảo import đúng
import { FiSearch, FiCheck, FiX } from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce'; // Hook debounce nếu có

interface Product {
  id: string;
  name: string;
  price: number;
  images: any;
  shopName?: string; // Tên shop nếu API trả về
}

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProductSelector({ selectedIds, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  // Gọi API tìm kiếm sản phẩm (Admin search all)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Gọi API search public hoặc API admin riêng
        const { data } = await apiClient.get(`/products/search?keyword=${debouncedSearch}&limit=10`);
        setProducts(data.items || data); // Tùy format response
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch]);

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(pid => pid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold mb-3">Chọn sản phẩm áp dụng</h3>
      
      {/* Search Input */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm tên sản phẩm..." 
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List Products */}
      <div className="max-h-60 overflow-y-auto bg-white border rounded-md divide-y">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Đang tìm...</div>
        ) : products.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm</div>
        ) : (
          products.map(p => {
            const isSelected = selectedIds.includes(p.id);
            const imgUrl = Array.isArray(p.images) ? p.images[0] : (p.images?.url || '/placeholder.png');
            
            return (
              <div 
                key={p.id} 
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50 transition ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => toggleProduct(p.id)}
              >
                <div className={`w-5 h-5 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {isSelected && <FiCheck className="text-white text-xs" />}
                </div>
                
                <img src={imgUrl} alt={p.name} className="w-10 h-10 object-cover rounded" />
                
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Number(p.price).toLocaleString()}đ</span>
                    {/* Nếu có tên shop thì hiện */}
                    {/* <span>{p.shopName}</span> */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Summary */}
      <div className="mt-3 flex flex-wrap gap-2">
        {selectedIds.length > 0 && (
          <span className="text-sm text-gray-600">Đã chọn: <b>{selectedIds.length}</b> sản phẩm</span>
        )}
      </div>
    </div>
  );
}