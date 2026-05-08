'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminService } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils'; // Đảm bảo bạn có hàm này
import { 
  FiSearch, FiShoppingBag, FiPackage, 
  FiStar, FiLock, FiUnlock, FiEye, FiAlertCircle 
} from 'react-icons/fi';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';
import Link from 'next/link';

export default function SellersPage() {
  // --- State quản lý dữ liệu ---
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const pageSize = 10;
  
  // Debounce để không gọi API liên tục khi gõ phím
  const debouncedSearch = useDebounce(search, 500);

  // --- Hàm gọi API lấy dữ liệu thực ---
  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi Service getSellersList vừa thêm
      const res: any = await AdminService.getSellersList({
        page,
        limit: pageSize,
        search: debouncedSearch
      });

      if (res?.data) {
        setSellers(res.data);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total ?? res.meta?.totalCount ?? res.data.length);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách người bán');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  // --- Hàm xử lý Khóa/Mở khóa Shop ---
  const handleToggleBan = async (seller: any) => {
    const isBanning = !seller.isBanned;
    const actionText = isBanning ? 'KHÓA' : 'MỞ KHÓA';
    
    // Xác nhận hành động
    if (!confirm(`Bạn có chắc muốn ${actionText} cửa hàng "${seller.shopName || seller.name}"?`)) return;

    let reason = '';
    if (isBanning) {
      reason = prompt('Nhập lý do khóa cửa hàng (bắt buộc):') || '';
      if (!reason) return toast.error('Vui lòng nhập lý do!');
    }

    try {
      await AdminService.toggleShopBan(seller.id, isBanning, reason);
      toast.success(`Đã ${isBanning ? 'khóa' : 'mở khóa'} thành công!`);
      fetchSellers(); // Load lại bảng sau khi update
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  // Gọi API khi page hoặc search thay đổi
  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // --- Helper render badge trạng thái ---
  const renderStatusBadge = (seller: any) => {
    if (seller.isBanned) {
        return (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit mx-auto">
                <FiLock size={12}/> Vi phạm
            </span>
        );
    }
    if (seller.isVerified) {
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Hoạt động</span>;
    }
    return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đối tác & Cửa hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi doanh thu, đánh giá và kiểm soát vi phạm của các Shop.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Tìm tên Shop, Email chủ shop..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E78720] text-sm shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold border-b border-gray-200">
                <th className="p-4 w-64">Cửa hàng / Chủ sở hữu</th>
                <th className="p-4 text-center">Hiệu quả</th>
                <th className="p-4 text-right">Doanh thu sàn</th>
                <th className="p-4 text-right">Ví khả dụng</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                // Skeleton Loading
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-10 bg-gray-100 rounded w-48"></div></td>
                    <td className="p-4"><div className="h-6 bg-gray-100 rounded w-20 mx-auto"></div></td>
                    <td className="p-4"><div className="h-6 bg-gray-100 rounded w-24 ml-auto"></div></td>
                    <td className="p-4"></td>
                    <td className="p-4"></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : sellers.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Không tìm thấy cửa hàng nào.</td></tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller.id} className={`hover:bg-gray-50 transition-colors ${seller.isBanned ? 'bg-red-50/30' : ''}`}>
                    {/* 1. Shop Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative">
                          {seller.avatar ? (
                            <img src={seller.avatar} alt={seller.shopName} className="w-full h-full object-cover"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                              {seller.shopName?.charAt(0).toUpperCase() || seller.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{seller.shopName || 'Chưa đặt tên Shop'}</p>
                          <p className="text-xs text-gray-500">{seller.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{seller.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Metrics (Rating, Orders, Products) */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="flex items-center gap-1 text-gray-700" title="Đánh giá trung bình">
                           <FiStar className="text-yellow-400 fill-yellow-400" size={14}/>
                           <span className="font-medium">{Number(seller.rating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                           <span title="Sản phẩm"><FiShoppingBag className="inline mr-1"/>{seller.totalProducts || 0}</span>
                           <span title="Đơn hàng thành công"><FiPackage className="inline mr-1"/>{seller.totalOrders || 0}</span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Revenue */}
                    <td className="p-4 text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(seller.totalRevenue || 0)}</div>
                      <div className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded w-fit ml-auto mt-1">
                        GMV
                      </div>
                    </td>

                    {/* 4. Wallet */}
                    <td className="p-4 text-right">
                      <div className="font-medium text-blue-600">{formatCurrency(Number(seller.walletBalance || 0))}</div>
                    </td>

                    {/* 5. Status */}
                    <td className="p-4 text-center">
                      {renderStatusBadge(seller)}
                    </td>

                    {/* 6. Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/sellers/${seller.id}`}
                          className="inline-flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <FiEye size={18} />
                        </Link>
                        
                        <button 
                          onClick={() => handleToggleBan(seller)}
                          className={`p-2 rounded-lg transition-colors ${
                            seller.isBanned 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-500 hover:bg-red-50'
                          }`}
                          title={seller.isBanned ? 'Mở khóa cửa hàng' : 'Khóa cửa hàng do vi phạm'}
                        >
                          {seller.isBanned ? <FiUnlock size={18} /> : <FiLock size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && sellers.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
              <span className="text-sm text-gray-500">
                Tổng: <b>{totalCount}</b> người bán · Trang {page}/{totalPages}
              </span>
              <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
        )}
      </div>
    </div>
  );
}