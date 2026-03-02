// src/modules/seller/products/ProductManagementPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; // [UPDATE] Thêm useRef
import { 
  Plus, Search, ChevronDown, ChevronUp, 
  LayoutList, LayoutGrid, RotateCcw,
  Edit, Trash2, Loader2, AlertCircle,
  Percent, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, X 
} from 'lucide-react';
import classNames from 'classnames';
import Link from 'next/link';
import { api } from '@/services/api';
import DiscountConfigModal from './components/DiscountConfigModal';
import { toast } from 'react-hot-toast'; // [OPTIONAL] Nếu bạn có dùng toast

// ... (Giữ nguyên các hàm helper getImageUrl, parsePrice và các component con TabItem, FilterInput, FilterDropdown, PriceDisplay)
const getImageUrl = (imgData: any): string => {
    if (!imgData) return '/placeholder.png';
    if (typeof imgData === 'string') return imgData;
    if (Array.isArray(imgData) && imgData.length > 0) {
        const first = imgData[0];
        if (typeof first === 'string') return first;
        if (typeof first === 'object' && first.url) return first.url;
    }
    return '/placeholder.png';
};

const parsePrice = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const strVal = String(value).trim();
  if (strVal === "") return 0;
  const cleanStr = strVal.replace(/[^0-9]/g, '');
  const num = Number(cleanStr);
  return isNaN(num) ? 0 : num;
};

// ... (Giữ nguyên TAB_MAPPING, STATUS_TABS, SUB_TABS, TabItem, FilterInput, FilterDropdown, PriceDisplay)
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
    { id: 'pending', label: 'Chờ duyệt', count: 0 },
    { id: 'violation', label: 'Vi phạm', count: 0 },
    { id: 'unpublished', label: 'Chưa được đăng', count: 0 },
];
  
const SUB_TABS = [
    { id: 'all_sub', label: 'Tất cả', count: null },
    { id: 'out_of_stock', label: 'Cần bổ sung hàng', count: 0 },
    { id: 'improve_content', label: 'Cần Cải Thiện Nội Dung', count: 0 },
];

const TabItem = ({ label, count, isActive, onClick }: any) => (
    <div 
      onClick={onClick}
      className={classNames(
        "cursor-pointer px-4 h-[48px] flex items-center justify-center border-b-[4px] transition-all whitespace-nowrap",
        isActive ? "border-orange-500 text-orange-500 font-medium" : "border-transparent text-gray-700 hover:text-orange-500"
      )}
    >
      <span className="text-base">{label} {count !== null && `(${count})`}</span>
    </div>
);
  
const FilterInput = ({ placeholder, icon, value }: any) => (
    <div className="flex items-center border border-gray-300 rounded-md bg-white h-[40px] px-3 w-full hover:border-orange-500 focus-within:border-orange-500 transition-colors">
      {icon && <span className="text-gray-400 mr-2">{icon}</span>}
      <input type="text" placeholder={placeholder} defaultValue={value} className="flex-1 outline-none text-sm font-light text-gray-900 placeholder:text-gray-400 bg-transparent"/>
    </div>
);
  
const FilterDropdown = ({ placeholder }: any) => (
    <div className="flex items-center justify-between border border-gray-300 rounded-md bg-white h-[40px] px-3 w-full cursor-pointer hover:border-orange-500 transition-colors group">
      <span className="text-sm font-light text-gray-400 group-hover:text-gray-600">{placeholder}</span>
      <ChevronDown className="text-gray-400" size={16} />
    </div>
);

const PriceDisplay = ({ product }: { product: any }) => {
    // ... (Giữ nguyên logic PriceDisplay của bạn)
    const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
    const isDiscountActive = product.isDiscountActive === true;
    const hasVariations = product.variations && product.variations.length > 0;
  
    if (hasVariations) {
        const prices = product.variations.map((v: any) => v.price).filter((p: any) => p > 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const isRange = minPrice !== maxPrice && prices.length > 1;
  
        return (
            <div className="flex flex-col">
                <span className="font-bold text-gray-900">
                    {isRange ? `${fmt(minPrice)} - ${fmt(maxPrice)}` : fmt(minPrice)}
                </span>
                {isDiscountActive && (
                   <div className="mt-1">
                       <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold text-red-600 bg-red-100 rounded border border-red-200 whitespace-nowrap">
                           Đang giảm giá
                       </span>
                   </div>
                )}
                 <div className="text-xs text-gray-400 mt-1">{product.variations.length} phân loại</div>
            </div>
        );
    }
  
    const currentPrice = parsePrice(product.price);
    const inputOriginalPrice = parsePrice(product.originalPrice || product.regularPrice);
    const discountType = product.discountType;
    let discountValue = 0;
    if (discountType === 'PERCENT' && typeof product.discountValue === 'string') {
        discountValue = parseFloat(product.discountValue) || 0;
    } else {
        discountValue = parsePrice(product.discountValue);
    }
  
    let finalPrice = currentPrice;
    let originalPrice = inputOriginalPrice;
  
    if (isDiscountActive) {
        if (originalPrice <= finalPrice) {
            if (discountType === 'PERCENT' && discountValue > 0 && discountValue < 100) {
                originalPrice = Math.round(finalPrice / (1 - discountValue / 100));
            } else if (discountType === 'AMOUNT' && discountValue > 0) {
                originalPrice = finalPrice + discountValue;
            }
        }
    } else {
        originalPrice = 0;
    }
  
    return (
        <div className="flex flex-col">
            <span className="font-bold text-gray-900">{fmt(finalPrice)}</span>
            {isDiscountActive && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {originalPrice > finalPrice && (
                        <span className="text-xs text-gray-400 line-through decoration-gray-300">
                            {fmt(originalPrice)}
                        </span>
                    )}
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold text-red-600 bg-red-100 rounded border border-red-200 whitespace-nowrap">
                        -{discountType === 'PERCENT' ? `${Math.round(discountValue)}%` : fmt(discountValue)}
                    </span>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
const ProductManagementPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('all_sub');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); 
  const [total, setTotal] = useState(0);
  const [jumpPage, setJumpPage] = useState("");

  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<any | null>(null);

  // [NEW] 1. State & Ref cho Selection Logic
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const startIdsSnapshot = useRef<Set<string>>(new Set()); // Lưu trạng thái trước khi Shift click

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const statusParam = TAB_MAPPING[activeTab] || 'ALL';
      
      const res: any = await api.get('/seller/products', {
        params: { 
            status: statusParam,
            page: page, 
            limit: limit 
        }
      });
      
      let dataList = [];
      let totalCount = 0;

      if (Array.isArray(res)) {
          totalCount = res.length;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          dataList = res.slice(startIndex, endIndex);
      } else if (res?.data) {
          dataList = res.data;
          totalCount = res.meta?.total || res.total || res.data.length; 
      }

      setProducts(dataList);
      setTotal(totalCount);

    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setJumpPage("");
  }, [activeTab, activeSubTab]);

  useEffect(() => {
    fetchProducts();
    // [NEW] Reset selection khi data đổi
    setSelectedIds(new Set());
    setLastSelectedId(null);
    startIdsSnapshot.current.clear();
  }, [activeTab, page, limit]);

  // [NEW] 2. Logic Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const allIds = products.map(p => p.id);
        const newSet = new Set(allIds);
        setSelectedIds(newSet);
        startIdsSnapshot.current = newSet; 
    } else {
        setSelectedIds(new Set());
        setLastSelectedId(null);
        startIdsSnapshot.current.clear();
    }
  };

  // [NEW] 3. Logic Handle Click Row (Shift / Ctrl / Click)
  const handleSelectRow = (id: string, event: React.MouseEvent) => {
    // Ngăn chặn nếu click vào các nút thao tác (Edit/Delete) bên trong row
    // (Đã xử lý ở nút button con bằng e.stopPropagation(), nhưng thêm logic ở đây cho chắc)
    
    // Logic Shift + Click (Range Selection)
    if (event.shiftKey && lastSelectedId) {
        const lastIndex = products.findIndex(p => p.id === lastSelectedId);
        const currentIndex = products.findIndex(p => p.id === id);

        if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            
            // Bắt đầu từ bản snapshot gốc (trạng thái trước khi giữ Shift)
            // Để khi thay đổi điểm cuối, các item dư ra sẽ tự bỏ chọn
            const newSelected = new Set(startIdsSnapshot.current);

            // Chỉ add các item nằm trong vùng range mới
            for (let i = start; i <= end; i++) {
                newSelected.add(products[i].id);
            }
            
            setSelectedIds(newSelected);
            // Lưu ý: KHÔNG update lastSelectedId khi đang giữ Shift để giữ điểm neo
        }
    } 
    // Logic Ctrl/Cmd + Click (Toggle Selection)
    else if (event.ctrlKey || event.metaKey) {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        setLastSelectedId(id);
        startIdsSnapshot.current = new Set(newSelected); // Cập nhật snapshot
    }
    // Logic Click Thường (Single Selection - hoặc Toggle nếu muốn behavior kiểu checkbox)
    else {
        // Ở giao diện quản lý dạng bảng, thường click row sẽ hoạt động như Toggle Checkbox
        // thay vì "Select One Only" như File Explorer. 
        // Logic dưới đây là TOGGLE (giống checkbox):
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        setLastSelectedId(id);
        startIdsSnapshot.current = new Set(newSelected);
    }
  };

  // [NEW] 4. Logic Xóa nhiều
  const handleBulkDelete = async () => {
      const count = selectedIds.size;
      if (count === 0) return;
      if (!window.confirm(`Bạn có chắc muốn xóa ${count} sản phẩm đã chọn?`)) return;

      setIsDeleting(true);
      try {
          const ids = Array.from(selectedIds);
          // Giả sử API hỗ trợ xóa nhiều, nếu không phải loop xóa từng cái
          // await api.post('/seller/products/bulk-delete', { ids }); 
          // Nếu chưa có API bulk, loop tạm thời:
          await Promise.all(ids.map(id => api.delete(`/seller/products/${id}`)));
          
          toast.success ? toast.success(`Đã xóa ${count} sản phẩm`) : alert(`Đã xóa ${count} sản phẩm`);
          fetchProducts();
          setSelectedIds(new Set());
      } catch (error) {
          console.error(error);
          alert('Có lỗi xảy ra khi xóa');
      } finally {
          setIsDeleting(false);
      }
  };

  const handleJumpPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const p = parseInt(jumpPage);
        const totalPages = Math.ceil(total / limit);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            setPage(p);
        } else {
            setJumpPage("");
        }
    }
  };

  const handleDeleteProduct = async (product: any) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`);
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await api.delete(`/seller/products/${product.id}`);
      alert("Đã xóa sản phẩm thành công!"); 
      fetchProducts();
    } catch (error: any) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert(error?.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  
  const renderPaginationItems = () => {
    const items = [];
    const MAX_VISIBLE_ALL = 15; 
    const SIBLING_COUNT = 3; 

    items.push(
        <button key="first" disabled={page === 1} onClick={() => setPage(1)} className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mx-0.5 text-gray-500 hover:text-orange-500">
            <ChevronsLeft size={16} />
        </button>
    );

    items.push(
      <button key="prev" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mx-0.5 text-gray-500 hover:text-orange-500">
        <ChevronLeft size={16} />
      </button>
    );

    const renderPageBtn = (i: number) => (
        <button
            key={i}
            onClick={() => setPage(i)}
            className={classNames(
                "min-w-[32px] h-8 px-2 flex items-center justify-center rounded-md mx-0.5 text-sm transition-colors border",
                page === i 
                    ? "bg-orange-500 text-white border-orange-500 font-medium" 
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-500 hover:text-orange-500"
            )}
        >
            {i}
        </button>
    );

    if (totalPages <= MAX_VISIBLE_ALL) {
        for (let i = 1; i <= totalPages; i++) {
            items.push(renderPageBtn(i));
        }
    } else {
        items.push(renderPageBtn(1));
        const startPage = Math.max(2, page - SIBLING_COUNT);
        const endPage = Math.min(totalPages - 1, page + SIBLING_COUNT);

        if (startPage > 2) {
            items.push(<span key="dots1" className="mx-1 text-gray-400 flex items-end pb-1 tracking-widest">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(renderPageBtn(i));
        }

        if (endPage < totalPages - 1) {
             items.push(<span key="dots2" className="mx-1 text-gray-400 flex items-end pb-1 tracking-widest">...</span>);
        }

        items.push(renderPageBtn(totalPages));
    }

    items.push(
      <button key="next" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mx-0.5 text-gray-500 hover:text-orange-500">
        <ChevronRight size={16} />
      </button>
    );

    items.push(
        <button key="last" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(totalPages)} className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mx-0.5 text-gray-500 hover:text-orange-500">
            <ChevronsRight size={16} />
        </button>
    );

    return items;
  };

  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen relative"> {/* Thêm relative cho container */}
      
      {/* HEADER SECTION */}
      <div className="bg-white shadow-sm mb-4">
        {/* ... (Header content giữ nguyên) ... */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-light">{isFilterExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
              {isFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <Link href="/seller-dashboard/products/add" className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 shadow-md transition-colors font-medium">
              <Plus size={18} />
              <span className="text-sm">Thêm 1 sản phẩm mới</span>
            </Link>
          </div>
        </div>

        <div className="flex border-b border-gray-200 px-6 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => <TabItem key={tab.id} {...tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />)}
        </div>
        <div className="flex px-6 pt-2 overflow-x-auto no-scrollbar bg-gray-50/50">
          {SUB_TABS.map(tab => <TabItem key={tab.id} {...tab} isActive={activeSubTab === tab.id} onClick={() => setActiveSubTab(tab.id)} />)}
        </div>
      </div>

      {/* FILTER SECTION (Giữ nguyên) */}
      {isFilterExpanded && (
        <div className="bg-white mx-6 p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            {/* ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <FilterInput placeholder="Tìm kiếm theo tên sản phẩm" icon={<Search size={16} />} />
                <FilterDropdown placeholder="Danh mục ngành hàng" />
                <FilterInput placeholder="SKU phân loại" />
                <FilterInput placeholder="SKU sản phẩm" />
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium min-w-[120px] justify-center"><Search size={16} /> Tìm kiếm</button>
                <button className="flex items-center gap-2 px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 font-medium min-w-[120px] justify-center"><RotateCcw size={16} /> Đặt lại</button>
            </div>
        </div>
      )}

      {/* [NEW] FLOATING ACTION BAR (Hiện khi có select) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-2">
                <span className="font-bold text-orange-400">{selectedIds.size}</span>
                <span className="text-sm">đã chọn</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors"
            >
                {isDeleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />} 
                Xoá ({selectedIds.size})
            </button>
            <button 
                onClick={() => { setSelectedIds(new Set()); setLastSelectedId(null); startIdsSnapshot.current.clear(); }}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors ml-2"
                title="Bỏ chọn"
            >
                <X size={16} />
            </button>
        </div>
      )}

      {/* PRODUCT LIST SECTION */}
      <div className="mx-6 bg-white rounded-lg shadow-sm border border-gray-200 mb-10 select-none"> {/* Thêm select-none */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 gap-4">
          <div className="text-lg font-light text-gray-900"><span className="font-medium">{total}</span> sản phẩm</div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline">Hiển thị:</span>
                <select 
                    value={limit} 
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 bg-white focus:border-orange-500 outline-none cursor-pointer"
                >
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                    <option value={100}>100 / trang</option>
                </select>
             </div>
             <div className="flex border border-gray-200 rounded-md overflow-hidden">
                <button className="p-2 bg-gray-100"><LayoutList size={18} /></button>
                <button className="p-2 bg-white border-l"><LayoutGrid size={18} /></button>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="pl-6 pr-4 py-4 w-[50px]">
                    {/* [UPDATE] Checkbox Header Select All */}
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        checked={products.length > 0 && selectedIds.size === products.length}
                        onChange={handleSelectAll}
                    />
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 min-w-[300px]">Tên Sản phẩm</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Giá</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Kho hàng</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                <th className="px-4 py-4 text-center text-sm font-medium text-gray-700 w-[140px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-20 text-center"><div className="flex justify-center items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Đang tải dữ liệu...</div></td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    {/* ... (Empty state) */}
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <Search size={40} strokeWidth={1} className="text-gray-300" />
                      <span className="text-sm font-light">Không tìm thấy sản phẩm nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    return (
                        <tr 
                            key={product.id} 
                            // [UPDATE] Thêm sự kiện onClick vào Row
                            onClick={(e) => handleSelectRow(product.id, e)}
                            className={classNames(
                                "border-b border-gray-100 transition-colors group cursor-pointer",
                                isSelected ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50/50"
                            )}
                        >
                            <td className="pl-6 pr-4 py-4 align-top">
                                {/* [UPDATE] Checkbox Row */}
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    readOnly // Để onClick của Row xử lý
                                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 pointer-events-none" 
                                />
                            </td>
                            
                            <td className="px-4 py-4 align-top">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden border border-gray-200 relative">
                                <img src={getImageUrl(product.images)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                <p className="text-sm text-gray-900 font-medium line-clamp-2 hover:text-orange-500" title={product.name}>{product.name}</p>
                                <span className="text-xs text-gray-400 mt-1 inline-block">ID: {product.id.slice(0, 8)}...</span>
                                </div>
                            </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-900 font-medium align-top">
                                <PriceDisplay product={product} />
                            </td>
                            
                            <td className="px-4 py-4 text-sm text-gray-700 align-top">{product.stock}</td>
                            
                            <td className="px-4 py-4 align-top">
                                {/* ... (Status badges giữ nguyên) */}
                                <div className="flex flex-col items-start gap-1">
                                    {product.status === 'ACTIVE' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>}
                                    {product.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>}
                                    {product.status === 'HIDDEN' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã ẩn</span>}
                                    {product.status === 'REJECTED' && (
                                        <>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Vi phạm</span>
                                            {product.rejectReason && (
                                                <div className="flex items-start gap-1.5 mt-1 text-red-600 bg-red-50 p-2 rounded-md border border-red-100 max-w-[220px]">
                                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                    <span className="text-xs leading-tight" title={product.rejectReason}>{product.rejectReason}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </td>

                            <td className="px-4 py-4 text-center align-top">
                            {/* [UPDATE] Thêm stopPropagation cho các nút action */}
                            <div className="flex justify-center gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedProductForDiscount(product); }}
                                    className="p-1.5 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors" 
                                    title="Cài đặt giảm giá"
                                >
                                    <Percent size={18} />
                                </button>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product); }}
                                    disabled={isDeleting}
                                    className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
                                    title="Xóa"
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                </button>
                            </div>
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER (Giữ nguyên) --- */}
        {products.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg gap-4">
                <div className="text-sm text-gray-500">
                    Hiển thị {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} trên {total} sản phẩm
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className="flex flex-wrap items-center justify-center gap-y-2">
                        {renderPaginationItems()}
                    </div>
                    <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Đến trang</span>
                        <input 
                            type="text" 
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            onKeyDown={handleJumpPage}
                            placeholder={String(page)}
                            className="w-12 h-8 border border-gray-300 rounded text-center text-sm focus:border-orange-500 focus:outline-none"
                        />
                        <span className="text-xs text-gray-400">/ {totalPages}</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Modal giảm giá */}
      {selectedProductForDiscount && (
        <DiscountConfigModal 
            isOpen={!!selectedProductForDiscount}
            product={selectedProductForDiscount}
            onClose={() => setSelectedProductForDiscount(null)}
            onSuccess={() => {
                fetchProducts();
                setSelectedProductForDiscount(null);
            }}
        />
      )}
    </div>
  );
};

export default ProductManagementPage;