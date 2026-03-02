'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, XCircle, Eye, Search, Filter, 
  Calendar, AlertCircle, Loader2
} from 'lucide-react';
import { AdminService } from '@/services/AdminService';
import classNames from 'classnames';
import Link from 'next/link';

// --- Types ---
interface Product {
  id: string;
  name: string;
  images: { url: string }[];
  price: number;
  stock: number;
  createdAt: string;
  seller: {
    name: string;
    avatar?: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

// --- Badge Component ---
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">Chờ duyệt</span>;
    case 'ACTIVE': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Đã duyệt</span>;
    case 'REJECTED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Từ chối</span>;
    default: return null;
  }
};

export default function ProductApprovalPage() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'REJECTED'>('PENDING');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean, productId: string | null }>({ isOpen: false, productId: null });
  const [rejectReason, setRejectReason] = useState('');

  // --- 1. Fetch Data ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Gọi API với status tương ứng tab đang chọn
      const data = await AdminService.getProducts(activeTab);
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]); // Gọi lại khi chuyển Tab

  // --- 2. Handlers ---
  const handleApprove = async (id: string) => {
    if (!confirm('Xác nhận duyệt sản phẩm này?')) return;
    try {
      await AdminService.approveProduct(id, 'ACTIVE');
      // Update UI ngay lập tức (xóa khỏi danh sách chờ)
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Đã duyệt thành công!');
    } catch (error) {
      alert('Lỗi khi duyệt sản phẩm.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.productId || !rejectReason.trim()) return;
    try {
      await AdminService.approveProduct(rejectModal.productId, 'REJECTED', rejectReason);
      setProducts(prev => prev.filter(p => p.id !== rejectModal.productId));
      setRejectModal({ isOpen: false, productId: null });
      setRejectReason('');
      alert('Đã từ chối sản phẩm.');
    } catch (error) {
      alert('Lỗi khi từ chối.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Duyệt sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và kiểm duyệt sản phẩm từ các Shop.</p>
        </div>
        <button onClick={fetchProducts} className="bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Làm mới</button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-8">
            {[
                { id: 'PENDING', label: 'Chờ duyệt', icon: <AlertCircle size={16}/> },
                { id: 'ACTIVE', label: 'Đã duyệt', icon: <CheckCircle2 size={16}/> },
                { id: 'REJECTED', label: 'Đã từ chối', icon: <XCircle size={16}/> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={classNames(
                        "pb-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-all",
                        activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    {tab.icon} {tab.label}
                    {/* Hiển thị số lượng nếu có data và đang ở tab đó */}
                    {tab.id === 'PENDING' && products.length > 0 && activeTab === 'PENDING' && (
                         <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">{products.length}</span>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Tìm kiếm sản phẩm..." />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                        <th className="px-6 py-4">Sản phẩm</th>
                        <th className="px-6 py-4">Shop</th>
                        <th className="px-6 py-4">Giá bán</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                         <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Đang tải...</td></tr>
                    ) : products.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">Không có dữ liệu trong mục này.</td></tr>
                    ) : (
                        products.map((p) => (
                            <tr key={p.id} className="hover:bg-blue-50/30 group">
                                <td className="px-6 py-4">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded border bg-gray-100 overflow-hidden shrink-0">
                                            {(() => {
                                                // Lấy ảnh đầu tiên
                                                const firstImg = p.images?.[0];
                                                // Kiểm tra xem nó là object {url} hay chuỗi string
                                                const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
                                                
                                                return imgUrl ? (
                                                    <img src={imgUrl} className="w-full h-full object-cover" alt="product" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                );
                                            })()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Calendar size={10}/> {new Date(p.createdAt).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {p.seller?.name?.charAt(0) || 'S'}
                                        </div>
                                        <span className="text-sm">{p.seller?.name || 'Unknown Shop'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/product/${p.id}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye size={18}/></Link>
                                        
                                        {/* Chỉ hiện nút Duyệt/Từ chối ở Tab PENDING */}
                                        {activeTab === 'PENDING' && (
                                            <>
                                                <button onClick={() => setRejectModal({ isOpen: true, productId: p.id })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><XCircle size={18}/></button>
                                                <button onClick={() => handleApprove(p.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1"><CheckCircle2 size={14}/> Duyệt</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800">Từ chối sản phẩm</h3>
                      <button onClick={() => setRejectModal({ isOpen: false, productId: null })}><XCircle size={20} className="text-gray-400 hover:text-gray-600"/></button>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-gray-600 mb-3">Lý do từ chối:</p>
                      <textarea className="w-full border rounded-lg p-3 text-sm focus:border-red-500 outline-none h-32 resize-none" placeholder="Nhập lý do..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                      <button onClick={() => setRejectModal({ isOpen: false, productId: null })} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
                      <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">Xác nhận</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}