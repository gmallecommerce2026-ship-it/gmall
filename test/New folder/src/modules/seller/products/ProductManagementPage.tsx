// src/modules/seller/products/ProductManagementPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronDown, ChevronUp, 
  Filter, LayoutList, LayoutGrid, RotateCcw,
  MoreHorizontal, Edit, Trash2, Loader2 // Thêm icon Loader
} from 'lucide-react';
import classNames from 'classnames';
import Link from 'next/link';
import { api } from '@/services/api'; // Import API client

// --- Constants & Types ---

// Mapping giữa UI Tab ID và Backend Enum
const TAB_MAPPING: Record<string, string> = {
  'all': 'ALL',
  'active': 'ACTIVE',
  'pending': 'PENDING',
  'violation': 'REJECTED',
  'unpublished': 'HIDDEN',
};

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả', count: null },
  { id: 'active', label: 'Đang hoạt động', count: 0 },
  { id: 'pending', label: 'Chờ duyệt bởi Love gift', count: 0 },
  { id: 'violation', label: 'Vi phạm', count: 0 },
  { id: 'unpublished', label: 'Chưa được đăng', count: 0 },
];

const SUB_TABS = [
  { id: 'all_sub', label: 'Tất cả', count: null },
  { id: 'out_of_stock', label: 'Cần bổ sung hàng', count: 0 },
  { id: 'improve_content', label: 'Cần Cải Thiện Nội Dung', count: 0 },
];

// --- Sub-components (GIỮ NGUYÊN) ---

const TabItem = ({ 
  label, 
  count, 
  isActive, 
  onClick 
}: { 
  label: string, 
  count?: number | null, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <div 
    onClick={onClick}
    className={classNames(
      "cursor-pointer px-4 h-[48px] flex items-center justify-center border-b-[4px] transition-all whitespace-nowrap",
      isActive 
        ? "border-orange-500 text-orange-500 font-medium" 
        : "border-transparent text-gray-700 hover:text-orange-500"
    )}
  >
    <span className="text-base">
      {label} {count !== null && `(${count})`}
    </span>
  </div>
);

const FilterInput = ({ 
  placeholder, 
  icon, 
  value 
}: { 
  placeholder: string, 
  icon?: React.ReactNode, 
  value?: string 
}) => (
  <div className="flex items-center border border-gray-300 rounded-md bg-white h-[40px] px-3 w-full hover:border-orange-500 focus-within:border-orange-500 transition-colors">
    {icon && <span className="text-gray-400 mr-2">{icon}</span>}
    <input 
      type="text" 
      placeholder={placeholder}
      defaultValue={value}
      className="flex-1 outline-none text-sm font-light text-gray-900 placeholder:text-gray-400 bg-transparent"
    />
  </div>
);

const FilterDropdown = ({ placeholder }: { placeholder: string }) => (
  <div className="flex items-center justify-between border border-gray-300 rounded-md bg-white h-[40px] px-3 w-full cursor-pointer hover:border-orange-500 transition-colors group">
    <span className="text-sm font-light text-gray-400 group-hover:text-gray-600">{placeholder}</span>
    <ChevronDown className="text-gray-400" size={16} />
  </div>
);

// --- Main Page Component ---

const ProductManagementPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('all_sub');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  
  // --- THÊM STATE LOGIC ---
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- HÀM GỌI API ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Chuyển đổi activeTab (frontend ID) sang status (backend Enum)
      const statusParam = TAB_MAPPING[activeTab] || 'ALL';
      
      const res = await api.get('/seller/products', {
        params: { status: statusParam }
      });
      
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]); // Gọi lại khi chuyển tab

  // --- RENDER ---
  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen">
      
      {/* HEADER SECTION (GIỮ NGUYÊN) */}
      <div className="bg-white shadow-sm mb-4">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-light">{isFilterExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
              {isFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <Link 
              href="/seller-dashboard/products/add" 
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 shadow-md transition-colors font-medium"
            >
              <Plus size={18} />
              <span className="text-sm">Thêm 1 sản phẩm mới</span>
            </Link>
          </div>
        </div>

        {/* Level 1 Tabs */}
        <div className="flex border-b border-gray-200 px-6 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => (
            <TabItem 
              key={tab.id} 
              {...tab} 
              isActive={activeTab === tab.id} 
              onClick={() => setActiveTab(tab.id)} 
            />
          ))}
        </div>

        {/* Level 2 Tabs */}
        <div className="flex px-6 pt-2 overflow-x-auto no-scrollbar bg-gray-50/50">
          {SUB_TABS.map(tab => (
            <TabItem 
              key={tab.id} 
              {...tab} 
              isActive={activeSubTab === tab.id} 
              onClick={() => setActiveSubTab(tab.id)} 
            />
          ))}
        </div>
      </div>

      {/* FILTER SECTION (GIỮ NGUYÊN) */}
      {isFilterExpanded && (
        <div className="bg-white mx-6 p-6 rounded-lg shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <FilterInput placeholder="Tìm kiếm theo tên sản phẩm" icon={<Search size={16} />} />
            <FilterDropdown placeholder="Danh mục ngành hàng" />
            <FilterInput placeholder="SKU phân loại" />
            <FilterInput placeholder="SKU sản phẩm" />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium min-w-[120px] justify-center">
              <Search size={16} /> Tìm kiếm
            </button>
            <button className="flex items-center gap-2 px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors font-medium min-w-[120px] justify-center">
              <RotateCcw size={16} /> Đặt lại
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT LIST SECTION */}
      <div className="mx-6 bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Stats & Tools Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 gap-4">
          <div className="text-lg font-light text-gray-900">
            <span className="font-medium">{products.length}</span> kiện hàng
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="hidden sm:inline">Sắp xếp theo:</span>
              <div className="w-[180px]">
                <FilterDropdown placeholder="Ngày tạo: Mới nhất" />
              </div>
            </div>
            
            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600"><LayoutList size={18} /></button>
              <button className="p-2 bg-white hover:bg-gray-50 text-gray-400 border-l border-gray-200"><LayoutGrid size={18} /></button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="pl-6 pr-4 py-4 w-[50px]">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 min-w-[300px]">Tên Sản phẩm</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Doanh số</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Giá</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Kho hàng</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                <th className="px-4 py-4 text-center text-sm font-medium text-gray-700 w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* --- LOGIC RENDER DATA --- */}
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" /> Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <Search size={40} strokeWidth={1} className="text-gray-300" />
                      <span className="text-sm font-light">Không tìm thấy sản phẩm nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                // Mapping Products
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                    <td className="pl-6 pr-4 py-4 align-top">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                           {/* Hiển thị ảnh thật từ API */}
                           {product.images && product.images[0] ? (
                             <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                           ) : null}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 font-medium line-clamp-2 hover:text-orange-500 cursor-pointer">
                            {product.name}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 inline-block">ID: {product.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">0</td> 
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{product.stock}</td>
                    <td className="px-4 py-4">
                        {/* Hiển thị Badge trạng thái */}
                        {product.status === 'ACTIVE' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>}
                        {product.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>}
                        {product.status === 'REJECTED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Vi phạm</span>}
                        {product.status === 'HIDDEN' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã ẩn</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="hover:text-blue-500" title="Chỉnh sửa"><Edit size={18} /></button>
                        <button className="hover:text-red-500" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage;