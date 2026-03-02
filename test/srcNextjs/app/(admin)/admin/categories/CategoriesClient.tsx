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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Plus size={18} /> Thêm danh mục
            </Button>
        </div>
      </div>

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