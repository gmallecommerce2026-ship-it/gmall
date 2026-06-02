"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button"; // Tận dụng component có sẵn
import { Plus, Search, Edit, Trash2, Filter, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/ApiClient";
import { toast } from "react-hot-toast";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  productCount: number;
  status: "active" | "inactive";
  description?: string | null;
}

export default function BrandsClient() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  // Wiki 0068 C7: trước đây dùng MOCK DATA (setTimeout) + nút sửa/xóa không có
  // onClick. Giờ wire thật vào BE (GET/PUT/DELETE/PATCH status đã có sẵn).
  const fetchBrands = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.get("/admin/brands", {
        params: { search: search || undefined, limit: 100 },
      });
      setBrands(Array.isArray(res?.data) ? res.data : []);
    } catch (error: any) {
      console.error("Lỗi tải thương hiệu", error);
      toast.error(error?.message || "Không tải được danh sách thương hiệu");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search 350ms → tránh gọi API mỗi keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      fetchBrands(searchTerm);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm, fetchBrands]);

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Xóa thương hiệu "${brand.name}"? Hành động không thể hoàn tác.`)) return;
    setBusyId(brand.id);
    try {
      await apiClient.delete(`/admin/brands/${brand.id}`);
      toast.success(`Đã xóa thương hiệu "${brand.name}"`);
      setBrands((prev) => prev.filter((b) => b.id !== brand.id));
    } catch (error: any) {
      // BE chặn xóa brand còn sản phẩm (409) → hiển thị message rõ ràng
      toast.error(error?.message || "Không xóa được thương hiệu");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    setBusyId(brand.id);
    const nextStatus = brand.status === "active" ? "inactive" : "active";
    // Optimistic update
    setBrands((prev) => prev.map((b) => (b.id === brand.id ? { ...b, status: nextStatus } : b)));
    try {
      await apiClient.patch(`/admin/brands/${brand.id}/status`);
      toast.success(nextStatus === "active" ? "Đã kích hoạt" : "Đã tạm ẩn");
    } catch (error: any) {
      // Revert nếu lỗi
      setBrands((prev) => prev.map((b) => (b.id === brand.id ? { ...b, status: brand.status } : b)));
      toast.error(error?.message || "Không đổi được trạng thái");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thương hiệu</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các thương hiệu đối tác chính thức</p>
        </div>
        <Link href="/admin/brands/create">
          <Button className="bg-[#E78720] hover:bg-[#d67610] text-white flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Thêm thương hiệu mới
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm tên thương hiệu..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E78720]/20 focus:border-[#E78720] transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center gap-2">
            <Filter size={16} /> {brands.length} thương hiệu
          </span>
        </div>
      </div>

      {/* Brand List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Thông tin thương hiệu</th>
                <th className="p-4 font-semibold text-center">Sản phẩm</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">
                  <Loader2 className="inline animate-spin mr-2" size={16} /> Đang tải dữ liệu...
                </td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Không tìm thấy thương hiệu nào.</td></tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{brand.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                          <p className="text-xs text-gray-500 max-w-[200px] truncate">{brand.description || "Chưa có mô tả"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {brand.productCount} SP
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {/* Click badge để bật/tắt trạng thái (PATCH status) */}
                      <button
                        onClick={() => handleToggleStatus(brand)}
                        disabled={busyId === brand.id}
                        title="Bấm để đổi trạng thái"
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-all hover:ring-2 hover:ring-offset-1 disabled:opacity-50
                          ${brand.status === "active" ? "bg-green-100 text-green-800 hover:ring-green-300" : "bg-gray-100 text-gray-800 hover:ring-gray-300"}`}
                      >
                        {brand.status === "active" ? "Hoạt động" : "Tạm ẩn"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/admin/brands/${brand.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand)}
                          disabled={busyId === brand.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Xóa"
                        >
                          {busyId === brand.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
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
}
