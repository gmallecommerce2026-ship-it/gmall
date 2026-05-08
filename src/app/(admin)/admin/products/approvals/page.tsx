"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { 
  CheckCircle2, XCircle, Eye, Search, 
  Calendar, AlertCircle, Loader2 
} from "lucide-react";
import classNames from "classnames";
import { toast } from "react-hot-toast";

import { AdminService } from "@/services/AdminService";

// Interface (Giữ nguyên)
interface ProductListItem {
  id: string;
  name: string;
  title?: string;
  images: { url: string }[] | string[]; 
  price: number;
  stock: number;
  createdAt: string;
  shop?: {
    name: string;
    avatar?: string;
  };
  status: "PENDING" | "ACTIVE" | "REJECTED";
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "PENDING":
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">Chờ duyệt</span>;
    case "ACTIVE":
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Đã duyệt</span>;
    case "REJECTED":
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Từ chối</span>;
    default:
      return null;
  }
};

export default function ProductApprovalPage() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE" | "REJECTED">("PENDING");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State chọn hàng loạt
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const startIdsSnapshot = useRef<Set<string>>(new Set());
  // Modal State
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; productId: string | null; isBulk: boolean }>({
    isOpen: false,
    productId: null,
    isBulk: false
  });
  const [rejectReason, setRejectReason] = useState("");

  // --- Fetch Data ---
  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    // Reset toàn bộ trạng thái select
    setSelectedIds([]);
    setLastSelectedId(null);
    startIdsSnapshot.current.clear();
    try {
      // TS-fix wiki 0031: getProducts yêu cầu `page` bắt buộc
      const res: any = await AdminService.getProducts({ page: 1, status: activeTab, limit: 100 });
      let dataList: ProductListItem[] = [];
      if (res?.data && Array.isArray(res.data)) {
         dataList = res.data;
      } else if (Array.isArray(res)) {
         dataList = res;
      }
      setProducts(dataList);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Handlers ---
  const handleApprove = async (id: string) => {
    if (!confirm("Xác nhận duyệt sản phẩm này?")) return;
    try {
      await AdminService.approveProduct(id, "ACTIVE");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã duyệt thành công!");
    } catch (error) {
      toast.error("Lỗi khi duyệt sản phẩm.");
    }
  };

  const handleSelectRow = (id: string, event: React.MouseEvent) => {
    // 1. Logic Shift + Click (Chọn theo vùng)
    if (event.shiftKey && lastSelectedId) {
      const lastIndex = products.findIndex((p) => p.id === lastSelectedId);
      const currentIndex = products.findIndex((p) => p.id === id);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);

        // Lấy danh sách gốc từ snapshot (để khi đổi điểm cuối, các item thừa tự bỏ chọn)
        const newSelectedSet = new Set(startIdsSnapshot.current);

        // Cộng thêm vùng range mới vào
        for (let i = start; i <= end; i++) {
          newSelectedSet.add(products[i].id);
        }

        // Chuyển về mảng để set state
        setSelectedIds(Array.from(newSelectedSet));
        // Lưu ý: Không update lastSelectedId khi đang giữ Shift
      }
    } 
    // 2. Logic Click thường / Ctrl (Toggle)
    else {
      let newSelected: string[];
      if (selectedIds.includes(id)) {
        newSelected = selectedIds.filter((item) => item !== id);
      } else {
        newSelected = [...selectedIds, id];
      }

      setSelectedIds(newSelected);
      setLastSelectedId(id); // Cập nhật điểm neo
      // Cập nhật snapshot mỗi khi click đơn lẻ
      startIdsSnapshot.current = new Set(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
      setLastSelectedId(null);
      startIdsSnapshot.current.clear(); // Reset snapshot
    } else {
      const allIds = products.map((p) => p.id);
      setSelectedIds(allIds);
      startIdsSnapshot.current = new Set(allIds); // Lưu snapshot full
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc muốn duyệt ${selectedIds.length} sản phẩm đã chọn?`)) return;

    try {
      await AdminService.bulkApproveProducts(selectedIds, "ACTIVE");
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Đã duyệt ${selectedIds.length} sản phẩm!`);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi duyệt hàng loạt.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    try {
      if (rejectModal.isBulk) {
        await AdminService.bulkApproveProducts(selectedIds, "REJECTED", rejectReason);
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        toast.success(`Đã từ chối ${selectedIds.length} sản phẩm.`);
      } else if (rejectModal.productId) {
        await AdminService.approveProduct(rejectModal.productId, "REJECTED", rejectReason);
        setProducts(prev => prev.filter(p => p.id !== rejectModal.productId));
        toast.success("Đã từ chối sản phẩm.");
      }
      setRejectModal({ isOpen: false, productId: null, isBulk: false });
      setRejectReason("");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xử lý từ chối.");
    }
  };

  const getProductImage = (images: any) => {
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      return typeof first === "string" ? first : first?.url;
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Duyệt sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và kiểm duyệt sản phẩm từ các Shop.</p>
        </div>
        <div className="flex gap-2">
            {selectedIds.length > 0 && activeTab === 'PENDING' && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-bottom-2 mr-4">
                    <span className="text-sm font-semibold text-blue-700 mr-2">Đã chọn: {selectedIds.length}</span>
                    <button onClick={() => setRejectModal({ isOpen: true, productId: null, isBulk: true })} className="px-3 py-1 bg-white border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 transition-colors">Từ chối</button>
                    <button onClick={handleBulkApprove} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm transition-colors">Duyệt tất cả</button>
                </div>
            )}
            <button onClick={fetchProducts} className="bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><Search size={14} /> Làm mới</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-8">
          {[
            { id: "PENDING", label: "Chờ duyệt", icon: <AlertCircle size={16} /> },
            { id: "ACTIVE", label: "Đã duyệt", icon: <CheckCircle2 size={16} /> },
            { id: "REJECTED", label: "Đã từ chối", icon: <XCircle size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={classNames("pb-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-all outline-none", activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
            >
              {tab.icon} {tab.label}
              {tab.id === "PENDING" && products.length > 0 && activeTab === "PENDING" && <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">{products.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                {/* 1. Cột Checkbox Header */}
                <th className="pl-6 pr-2 py-4 w-10">
                    {activeTab === 'PENDING' && products.length > 0 && (
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedIds.length === products.length && products.length > 0}
                            onChange={handleSelectAll}
                        />
                    )}
                </th>
                
                {/* 2. [MỚI] Cột STT Header */}
                <th className="px-2 py-4 w-12 text-center">#</th>

                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Đang tải...</div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 italic">Không có dữ liệu.</td>
                </tr>
              ) : (
                products.map((p, index) => { // Sử dụng index
                  const imgUrl = getProductImage(p.images);
                  const isSelected = selectedIds.includes(p.id);
                  
                  return (
                    <tr key={p.id} onClick={(e) => handleSelectRow(p.id, e)}className={classNames("group transition-colors", isSelected ? "bg-blue-50/60" : "hover:bg-blue-50/30")}>
                      {/* 1. Cột Checkbox Row */}
                      <td className="pl-6 pr-2 py-4">
                        {activeTab === 'PENDING' && (
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={isSelected}
                                readOnly
                            />
                        )}
                      </td>

                      {/* 2. [MỚI] Cột STT Row */}
                      <td className="px-2 py-4 text-center text-xs font-medium text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded border bg-gray-100 overflow-hidden shrink-0 relative">
                            {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt="product" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={p.name || p.title}>{p.name || p.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString("vi-VN")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                            {p.shop?.avatar ? <img src={p.shop.avatar} className="w-full h-full object-cover" alt="Shop" /> : (p.shop?.name?.charAt(0) || "S")}
                          </div>
                          <span className="text-sm font-medium truncate max-w-[150px]">{p.shop?.name || "Unknown Shop"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}</td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/admin/products/${p.id}/approval`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Xem chi tiết"><Eye size={18} /></Link>
                          {activeTab === "PENDING" && (
                            <>
                              <button onClick={() => setRejectModal({ isOpen: true, productId: p.id, isBulk: false })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Từ chối"><XCircle size={18} /></button>
                              <button onClick={() => handleApprove(p.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1 transition-colors shadow-sm"><CheckCircle2 size={14} /> Duyệt</button>
                            </>
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
      </div>

      {/* Modal Reject (Giữ nguyên) */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{rejectModal.isBulk ? `Từ chối ${selectedIds.length} sản phẩm` : "Từ chối sản phẩm"}</h3>
              <button onClick={() => setRejectModal({ isOpen: false, productId: null, isBulk: false })}><XCircle size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Lý do từ chối:</p>
              <textarea className="w-full border rounded-lg p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-200 outline-none h-32 resize-none transition-all" placeholder="Nhập lý do vi phạm..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
              <button onClick={() => setRejectModal({ isOpen: false, productId: null, isBulk: false })} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}