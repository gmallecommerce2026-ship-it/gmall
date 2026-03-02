'use client';

import React, { useEffect, useState } from 'react';
import { 
    FiSearch, FiEye, FiExternalLink, FiFilter, FiSlash, 
    FiCheckCircle, FiX, FiTrash2, FiCopy, 
    FiAlertTriangle
} from 'react-icons/fi';
import { AdminService } from '@/services/AdminService';
import { Product } from '@/types/product';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { CategoryCascader } from '@/modules/seller/products/components/CategoryCascader';

// 1. ĐỊNH NGHĨA INTERFACE (KHẮC PHỤC LỖI ProductWithShop)
interface ProductWithShop extends Omit<Product, 'category'> {
    name?: string; 
    shop?: {
        id: string;
        name: string;
        avatar?: string;
    };
    category?: {
        id: string;
        name: string;
        slug?: string;
    };
    _count?: {
        variants: number;
    }
}

// 2. ĐỊNH NGHĨA HẰNG SỐ (KHẮC PHỤC LỖI TABS, DEFAULT_PRODUCT_IMG)
const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ duyệt' },
    { id: 'ACTIVE', label: 'Đang hoạt động' },
    { id: 'REJECTED', label: 'Vi phạm/Từ chối' },
];

const ITEMS_PER_PAGE = 20;
const DEFAULT_PRODUCT_IMG = "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image";

export default function ProductsClient() {
    // --- State ---
    const [products, setProducts] = useState<ProductWithShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [confirmDeleteText, setConfirmDeleteText] = useState('');
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter Category
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
    const [selectedCategoryPath, setSelectedCategoryPath] = useState<any[]>([]); 

    // [NEW] Checkbox Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
    const startIdsSnapshot = React.useRef<Set<string>>(new Set());
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [refreshKey, setRefreshKey] = useState(0);

    // 3. CÁC HÀM TIỆN ÍCH (KHẮC PHỤC LỖI formatCurrency, getProductImage)
    const isValidUrl = (url?: any): boolean => {
        if (!url) return false;
        if (typeof url !== 'string') return false;
        if (url.trim() === '') return false;
        return url.startsWith('http') || url.startsWith('/');
    };

    const getProductImage = (prod: ProductWithShop) => {
        if (isValidUrl(prod.imageUrl)) return prod.imageUrl;
        if (Array.isArray(prod.images) && prod.images.length > 0) {
            const firstImg = prod.images[0];
            if (isValidUrl(firstImg)) return firstImg;
        }
        return DEFAULT_PRODUCT_IMG;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const getProductName = (prod: ProductWithShop) => {
        return prod.title || prod.name || 'Sản phẩm không tên';
    };

    const getProductDetailLink = (prod: ProductWithShop) => {
        const baseUrl = `/admin/products/${prod.id}/approval`;
        if (statusFilter === 'ALL') {
            return `${baseUrl}?viewMode=true`;
        }
        return baseUrl;
    };

    // --- Fetch Data ---
    const fetchProducts = async () => {
        try {
            setLoading(true);
            if(products.length === 0) setSelectedIds(new Set()); 

            const res: any = await AdminService.getProducts({
                page: page,
                limit: ITEMS_PER_PAGE,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                search: debouncedSearch,
                categoryId: selectedCategoryId,
                _t: new Date().getTime() 
            });

            if (res?.data) {
                setProducts(res.data);
                setTotalPages(res.meta?.totalPages || 1);
                setTotalItems(res.meta?.total || 0);
            } else if (Array.isArray(res)) {
                const allItems = res;
                const startIndex = (page - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                const paginatedItems = allItems.slice(startIndex, endIndex);

                setProducts(paginatedItems);
                setTotalItems(allItems.length);
                setTotalPages(Math.ceil(allItems.length / ITEMS_PER_PAGE));
            } else {
                setProducts([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        setSelectedIds(new Set());
        setLastSelectedId(null);
        startIdsSnapshot.current.clear(); // [ADD THIS] Reset snapshot
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter, debouncedSearch, selectedCategoryId, refreshKey]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter, debouncedSearch, selectedCategoryId]);

    const reloadData = () => {
        setRefreshKey(prev => prev + 1);
        setSelectedIds(new Set());
    };

    // [NEW] Handle Copy ID
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Đã sao chép ID');
    };

    const handleDeleteAllSubmit = async () => {
        if (confirmDeleteText !== 'tôi muốn xoá tất cả sản phẩm trên sàn') {
            toast.error('Câu xác nhận chưa chính xác!');
            return;
        }

        try {
            setIsDeletingAll(true);
            const res: any = await AdminService.deleteAllProducts();
            toast.success(res?.message || 'Đã xoá sạch toàn bộ sản phẩm!');
            setIsDeleteAllModalOpen(false);
            setConfirmDeleteText('');
            reloadData(); // Refresh lại list
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi xoá toàn bộ sản phẩm');
        } finally {
            setIsDeletingAll(false);
        }
    };

    // [NEW] Handle Checkbox Logic
    const handleSelectRow = (id: string, event: React.MouseEvent) => {
        event.stopPropagation(); 
        
        // Logic Shift + Click (Range Selection)
        if (event.shiftKey && lastSelectedId) {
            const lastIndex = products.findIndex(p => p.id === lastSelectedId);
            const currentIndex = products.findIndex(p => p.id === id);

            if (lastIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastIndex, currentIndex);
                const end = Math.max(lastIndex, currentIndex);
                
                // Bắt đầu từ bản snapshot gốc (trạng thái trước khi giữ Shift)
                const newSelected = new Set(startIdsSnapshot.current);

                // Chỉ add các item nằm trong vùng range mới (Start -> New End)
                for (let i = start; i <= end; i++) {
                    newSelected.add(products[i].id);
                }
                
                setSelectedIds(newSelected);
                // Lưu ý: Không update lastSelectedId và startIdsSnapshot khi đang giữ Shift
                // để giữ nguyên điểm neo (Anchor) ban đầu.
            }
        } 
        // Logic Click thường hoặc Ctrl + Click
        else {
            const newSelected = new Set(selectedIds);
            
            // Nếu muốn behavior giống File Explorer: Click thường (không Ctrl) sẽ clear các cái khác
            // Nhưng ở đây ta giữ behavior giống Checkbox (Toggle) để thân thiện với web
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }

            setLastSelectedId(id); // Đặt đây là điểm neo mới
            setSelectedIds(newSelected);
            
            // [IMPORTANT] Cập nhật bản chụp mỗi khi thực hiện single click
            startIdsSnapshot.current = new Set(newSelected);
        }
    };

    // [NEW] Select All
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = products.map(p => p.id);
            const newSet = new Set(allIds);
            setSelectedIds(newSet);
            startIdsSnapshot.current = newSet; // [ADD THIS]
        } else {
            setSelectedIds(new Set());
            setLastSelectedId(null);
            startIdsSnapshot.current.clear(); // [ADD THIS]
        }
    };

    // [NEW] Delete Single
    const handleDelete = async (id: string) => {
        if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xoá vĩnh viễn sản phẩm này?')) return;
        try {
            await AdminService.deleteProduct(id);
            toast.success('Đã xoá sản phẩm');
            reloadData();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xoá sản phẩm');
        }
    };

    // [NEW] Delete Bulk
    const handleBulkDelete = async () => {
        const count = selectedIds.size;
        if (count === 0) return;
        if (!window.confirm(`CẢNH BÁO: Bạn đang chọn xoá ${count} sản phẩm. Hành động này KHÔNG THỂ hoàn tác.`)) return;

        try {
            const idsArray = Array.from(selectedIds);
            await AdminService.bulkDeleteProducts(idsArray);
            toast.success(`Đã xoá ${count} sản phẩm thành công`);
            reloadData();
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi xoá hàng loạt');
        }
    };

    const handleQuickBan = async (id: string) => {
        const reason = prompt('Nhập lý do khóa sản phẩm này:');
        if (reason === null) return; 
        
        if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do để khóa sản phẩm');
            return;
        }

        try {
            await AdminService.approveProduct(id, 'REJECTED', reason);
            toast.success('Đã khóa sản phẩm thành công');
            reloadData();
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi khóa sản phẩm');
        }
    };

    const handleQuickUnban = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn mở khóa (duyệt lại) sản phẩm này?')) return;
        try {
            await AdminService.approveProduct(id, 'ACTIVE');
            toast.success('Đã mở khóa sản phẩm thành công');
            reloadData();
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi mở khóa sản phẩm');
        }
    };

    const handleSelectCategory = (leafId: string, path: any[]) => {
        setSelectedCategoryId(leafId);
        setSelectedCategoryPath(path);
        setShowCategoryFilter(false); 
    };

    const clearCategoryFilter = () => {
        setSelectedCategoryId(undefined);
        setSelectedCategoryPath([]);
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'ACTIVE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Hoạt động</span>;
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Chờ duyệt</span>;
            case 'REJECTED':
            case 'BANNED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Đã khóa/Từ chối</span>;
            case 'HIDDEN':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Đã ẩn</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 relative pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng cộng: {totalItems} sản phẩm (Hiển thị {ITEMS_PER_PAGE}/trang)</p>
                </div>
                <button 
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 font-medium"
                    >
                        <FiAlertTriangle /> Xoá tất cả
                    </button>
                 <button 
                    onClick={reloadData} 
                    className="md:self-center px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <FiSearch className={loading ? "animate-spin" : ""} /> Làm mới
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-6 border-b border-gray-200 text-sm scrollbar-hide">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        className={`pb-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                            statusFilter === tab.id
                                ? 'border-[#E78720] text-[#E78720]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên sản phẩm, SKU hoặc tên Shop..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-[#E78720] transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    {selectedCategoryId && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm animate-in fade-in">
                            <span className="font-medium truncate max-w-[150px]" title={selectedCategoryPath.map(c => c.name).join(' > ')}>
                                {selectedCategoryPath.length > 0 ? selectedCategoryPath[selectedCategoryPath.length - 1].name : 'Đã lọc'}
                            </span>
                            <button onClick={clearCategoryFilter} className="hover:text-red-500 ml-1" title="Xóa lọc">
                                <FiX size={16} />
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowCategoryFilter(true)}
                        className={`px-4 py-2.5 border rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                            selectedCategoryId 
                                ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700' 
                                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-white'
                        }`}
                    >
                        <FiFilter /> {selectedCategoryId ? 'Đổi danh mục' : 'Lọc danh mục'}
                    </button>
                </div>
            </div>

            {/* Modal Chọn Danh Mục */}
            {showCategoryFilter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowCategoryFilter(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                        
                        <div className="h-full w-full pt-2">
                             <CategoryCascader 
                                onSelect={handleSelectCategory}
                                onClose={() => setShowCategoryFilter(false)}
                                allowSelectParent={true} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-400">{selectedIds.size}</span>
                        <span className="text-sm">đã chọn</span>
                    </div>
                    <div className="h-4 w-px bg-gray-600"></div>
                    <button 
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors"
                    >
                        <FiTrash2 size={16} /> Xoá tất cả
                    </button>
                    <button 
                        onClick={() => { setSelectedIds(new Set()); setLastSelectedId(null); }}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors ml-2"
                    >
                        <FiX size={16} />
                    </button>
                </div>
            )}

{isDeleteAllModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-full text-red-600">
                                <FiAlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-800">VÙNG NGUY HIỂM</h3>
                                <p className="text-sm text-red-600">Hành động này không thể hoàn tác!</p>
                            </div>
                            <button 
                                onClick={() => setIsDeleteAllModalOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-red-200 rounded-full text-red-500 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700">
                                Bạn đang chuẩn bị <span className="font-bold text-red-600">XOÁ VĨNH VIỄN TOÀN BỘ {totalItems} SẢN PHẨM</span> khỏi hệ thống. 
                            </p>
                            <p className="text-sm text-gray-500">
                                Tất cả dữ liệu liên quan bao gồm: Biến thể, Tuỳ chọn, Cross-sell và Cache Redis sẽ bị huỷ bỏ.
                            </p>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                                    Nhập chính xác dòng chữ sau để xác nhận:
                                </label>
                                <div className="text-sm font-mono font-bold text-gray-800 select-all bg-white border border-gray-200 p-2 rounded mb-3 text-center">
                                    tôi muốn xoá tất cả sản phẩm trên sàn
                                </div>
                                <input 
                                    type="text" 
                                    value={confirmDeleteText}
                                    onChange={(e) => setConfirmDeleteText(e.target.value)}
                                    placeholder="Nhập dòng chữ xác nhận ở trên..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button 
                                onClick={() => setIsDeleteAllModalOpen(false)}
                                disabled={isDeletingAll}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Huỷ bỏ
                            </button>
                            <button 
                                onClick={handleDeleteAllSubmit}
                                disabled={isDeletingAll || confirmDeleteText !== 'tôi muốn xoá tất cả sản phẩm trên sàn'}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-2 transition-all"
                            >
                                {isDeletingAll ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Đang xoá...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 /> Xác nhận xoá sạch
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Table Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden select-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 w-10 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                        checked={products.length > 0 && selectedIds.size === products.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-4 py-4 w-24">ID</th>
                                <th className="px-6 py-4 w-[35%]">Sản phẩm</th>
                                <th className="px-6 py-4">Giá & Kho</th>
                                <th className="px-6 py-4 text-center">Biến thể</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-4 text-center"><div className="h-4 w-4 bg-gray-100 rounded animate-pulse mx-auto"></div></td>
                                        <td className="px-6 py-4" colSpan={6}><div className="h-12 bg-gray-100 rounded w-full animate-pulse"></div></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FiSearch size={24} className="text-gray-300 mb-2" />
                                            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((prod) => {
                                    const isSelected = selectedIds.has(prod.id);
                                    return (
                                        <tr 
                                            key={prod.id} 
                                            onClick={(e) => handleSelectRow(prod.id, e)} 
                                            className={`transition-colors cursor-pointer group ${
                                                isSelected ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <td className="px-4 py-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => {}} 
                                                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 pointer-events-none" 
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1 group/id">
                                                    <span className="font-mono text-xs text-gray-500 truncate w-16" title={prod.id}>
                                                        {prod.id.split('-')[0]}...
                                                    </span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(prod.id); }}
                                                        className="text-gray-300 hover:text-gray-600 opacity-0 group-hover/id:opacity-100 transition-opacity"
                                                        title="Sao chép Full ID"
                                                    >
                                                        <FiCopy size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 relative">
                                                        <img 
                                                            src={getProductImage(prod)} 
                                                            className="w-full h-full object-cover" 
                                                            alt={getProductName(prod)}
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                if (target.src !== DEFAULT_PRODUCT_IMG) {
                                                                    target.src = DEFAULT_PRODUCT_IMG;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <Link 
                                                          href={getProductDetailLink(prod)}
                                                          onClick={(e) => e.stopPropagation()}
                                                          className="font-medium text-gray-800 line-clamp-2 hover:text-[#E78720] transition-colors mb-1"
                                                       >
                                                          {getProductName(prod)}
                                                       </Link>

                                                        {prod.category && (
                                                            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                                <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">
                                                                    {prod.category.name}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>Shop:</span>
                                                            <Link href={`/admin/shops/${prod.shopId || prod.sellerId}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-blue-600 hover:underline">
                                                                {prod.shop?.avatar && <img src={prod.shop.avatar} className="w-4 h-4 rounded-full border border-gray-200" alt="" />}
                                                                {prod.shop?.name || prod.shopName || 'Unknown Shop'}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-[#E78720]">{formatCurrency(prod.price)}</p>
                                                <p className="text-gray-500 text-xs mt-1">Kho: {prod.stock || prod.stockTotal || 0}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                    {prod._count?.variants || prod.variants?.length || 0} biến thể
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderStatusBadge(prod.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        href={getProductDetailLink(prod)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <FiEye size={18} />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(prod.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xoá vĩnh viễn"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>

                                                    {(prod.status === 'APPROVED' || prod.status === 'ACTIVE') && (
                                                        <button
                                                            onClick={() => handleQuickBan(prod.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Khóa sản phẩm này"
                                                        >
                                                            <FiSlash size={18} />
                                                        </button>
                                                    )}

                                                    {(prod.status === 'REJECTED' || prod.status === 'BANNED' || prod.status === 'PENDING') && (
                                                        <button
                                                            onClick={() => handleQuickUnban(prod.id)}
                                                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Mở khóa / Duyệt lại"
                                                        >
                                                            <FiCheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    
                                                    {(prod.status === 'APPROVED' || prod.status === 'ACTIVE') && (
                                                        <a 
                                                            href={`/product-details/${prod.id}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Xem hiển thị thực tế"
                                                        >
                                                            <FiExternalLink size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <span className="text-sm text-gray-500">
                            Trang <span className="font-medium text-gray-900">{page}</span> / {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Trước
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}