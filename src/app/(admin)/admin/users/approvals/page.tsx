"use client";
import React, { useEffect, useState, useCallback } from "react";
import { AdminService } from "@/services/AdminService";
import { toast } from "react-hot-toast";
import { FiRefreshCcw, FiFilter, FiSearch } from "react-icons/fi";
import { SellerDossierModal } from "@/components/admin/approvals/SellerDossierModal"; // Import component mới
// wiki 0111: báo cho menu quản trị cập nhật số việc đang chờ ngay sau khi xử lý,
// vì trang này xử lý tại chỗ và KHÔNG điều hướng đi đâu cả.
import { notifyPendingCountsChanged } from '@/lib/admin/pendingCounts';

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'update'>('register');
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý shop đang chọn để xem hồ sơ
  const [selectedShop, setSelectedShop] = useState<any>(null);

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'register') {
        res = await AdminService.getPendingShops(1, 20);
      } else {
        res = await AdminService.getShopUpdateRequests(1, 20);
      }
      setData(res?.data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hành động Duyệt
  const handleApprove = async () => {
    if (!selectedShop) return;
    try {
        if (activeTab === 'register') {
            await AdminService.approveShop(selectedShop.id);
            notifyPendingCountsChanged();
            toast.success("Đã duyệt shop mới thành công");
        } else {
            await AdminService.approveShopUpdate(selectedShop.id);
            notifyPendingCountsChanged();
            toast.success("Đã duyệt cập nhật thông tin thành công");
        }
        setSelectedShop(null);
        fetchData(); 
    } catch (err: any) {
        toast.error(err?.message || "Có lỗi xảy ra khi duyệt");
    }
  };

  // wiki 0108: TRƯỚC ĐÂY đây là nút giả. Lời gọi `AdminService.rejectShop` bị comment
  // lại và thay bằng toast `"Đã từ chối hồ sơ (Demo)"` — admin bấm Từ chối, thấy báo
  // thành công, đóng hộp thoại, nhưng shop **vẫn nguyên trạng thái PENDING** và vẫn nằm
  // trong hàng chờ. Không ai biết cho tới khi đối chiếu DB.
  //
  // Cả hai đầu đều đã sẵn sàng từ lâu: FE có `AdminService.rejectShop` (PATCH
  // `/admin/users/:id/reject`), BE có `@Patch(':id/reject')` → `rejectShop()` đặt
  // `Shop.status = REJECTED` và ghi `banReason`. Chỉ thiếu đúng một dòng gọi.
  const handleReject = async () => {
    if (!selectedShop) return;
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
        await AdminService.rejectShop(selectedShop.id, reason);
        notifyPendingCountsChanged();
        toast.success("Đã từ chối hồ sơ");
        setSelectedShop(null);
        fetchData();
    } catch (err: any) {
        toast.error(err?.message || "Lỗi khi từ chối");
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Thẩm định hồ sơ Shop</h1>
            <p className="text-gray-500 mt-1">Duyệt các yêu cầu đăng ký mở bán và cập nhật thông tin pháp lý</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm transition-all">
            <FiRefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- FILTER BAR & TABS --- */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex mb-6">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Đăng ký mới ({activeTab === 'register' ? data.length : '...'})
        </button>
        <button
          onClick={() => setActiveTab('update')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'update' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Cập nhật hồ sơ ({activeTab === 'update' ? data.length : '...'})
        </button>
      </div>

      {/* --- TABLE (MAIN CONTENT) --- */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin Shop</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Chủ sở hữu</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian gửi</th>
              <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                        </td>
                    </tr>
                ))
            ) : data.length === 0 ? (
                <tr>
                    <td colSpan={4} className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                        <FiFilter size={48} className="mb-4 opacity-20"/>
                        <span>Không có hồ sơ nào đang chờ duyệt.</span>
                    </td>
                </tr>
            ) : (
              data.map((shop) => (
                <tr key={shop.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 overflow-hidden shrink-0">
                            {shop.logo && <img src={shop.logo} className="w-full h-full object-cover"/>}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{shop.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">#{shop.id.substring(0,8)}...</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-medium text-gray-800">{shop.owner?.name}</div>
                    <div className="text-xs text-gray-500">{shop.owner?.email}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm text-gray-600">
                        {new Date(shop.updatedAt || shop.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date(shop.updatedAt || shop.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                        onClick={() => setSelectedShop(shop)}
                        className="bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:shadow-md px-4 py-2 rounded-lg text-sm font-semibold transition-all transform active:scale-95"
                    >
                        Thẩm định hồ sơ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- SỬ DỤNG COMPONENT MODAL MỚI --- */}
      {selectedShop && (
        <SellerDossierModal
            shop={selectedShop}
            type={activeTab}
            onClose={() => setSelectedShop(null)}
            onApprove={handleApprove}
            onReject={handleReject}
        />
      )}
    </div>
  );
}