// src/app/(admin)/admin/categories/CategoriesClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { Plus, Edit, Trash2, FolderTree, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api/ApiClient"; // Import client

// Định nghĩa kiểu dữ liệu category cho Admin
interface Category {
  id: string | number; // Tùy DB của bạn
  name: string;
  slug: string;
  productCount?: number; // Backend cần trả về số lượng sản phẩm (nếu có)
  status?: string; // active/inactive
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // wiki 0108: nút "Thêm danh mục" trước đây KHÔNG có `onClick` — bấm vào không có gì
  // xảy ra, không mở form, không báo lỗi. Đây là màn quản trị danh mục nên đó là chức
  // năng chính của trang. Dựng một hộp thoại gọn: tên (bắt buộc) + danh mục cha (tuỳ chọn),
  // đúng bằng `CreateCategoryDto` của BE (`name` bắt buộc, `slug`/`parentId` tuỳ chọn —
  // BE tự sinh slug).
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setCreateError("Vui lòng nhập tên danh mục");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await apiClient.post('/categories', {
        name,
        ...(newParentId ? { parentId: newParentId } : {}),
      });
      setShowCreate(false);
      setNewName("");
      setNewParentId("");
      await fetchCategories();
    } catch (err: any) {
      // Nói ra lỗi thật thay vì im lặng — đây là màn quản trị, người dùng cần biết vì sao hỏng.
      setCreateError(err?.message || "Không tạo được danh mục, vui lòng thử lại");
    } finally {
      setCreating(false);
    }
  };

  // Hàm fetch data tách riêng để có thể gọi lại sau khi Thêm/Sửa/Xóa
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Gọi API
      const res = await apiClient.get('/categories');
      if (res && Array.isArray(res)) {
        setCategories(res);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-500 mt-1">Cấu trúc danh mục hiển thị trên trang chủ</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCategories} disabled={loading}>
                 <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button
                onClick={() => { setShowCreate(true); setCreateError(null); }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
                <Plus size={18} /> Thêm danh mục
            </Button>
        </div>
      </div>

      {showCreate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tao-danh-muc-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !creating && setShowCreate(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
          >
            <h2 id="tao-danh-muc-title" className="text-lg font-bold text-gray-900">Thêm danh mục</h2>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Tên danh mục</span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={150}
                placeholder="Ví dụ: Đồ chơi trẻ em"
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Danh mục cha (tuỳ chọn)</span>
              <select
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option value="">— Danh mục gốc —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            {createError && <p className="text-sm text-red-600">{createError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={creating}>
                Huỷ
              </Button>
              <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {creating ? "Đang tạo…" : "Tạo danh mục"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 font-medium text-gray-700 flex items-center gap-2">
                <FolderTree size={18} /> Danh sách danh mục
            </div>
            
            <div className="divide-y divide-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Chưa có danh mục nào.</div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="text-xs">IMG</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{cat.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        /{cat.slug} 
                                        {cat.productCount !== undefined && ` • ${cat.productCount} sản phẩm`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                    <Edit size={16} />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        
        {/* Helper text giữ nguyên... */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Lưu ý</h3>
            <ul className="space-y-3 text-sm text-gray-600 list-disc pl-4">
                <li>Dữ liệu hiện tại đã được đồng bộ từ Server.</li>
                <li>Danh mục cấp 1 sẽ hiển thị trên thanh Menu chính.</li>
                <li>Icon danh mục nên dùng định dạng SVG hoặc PNG trong suốt.</li>
            </ul>
        </div>
      </div>
    </div>
  );
}