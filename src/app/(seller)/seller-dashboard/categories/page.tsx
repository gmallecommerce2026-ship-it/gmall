'use client';
import React, { useState, useEffect } from 'react';
import { ShopService, ShopCategory } from '@/services/shop.service';
import Button from '@/components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from 'react-icons/fi';
import ProductSelectionModal from '@/modules/seller/categories/components/ProductSelectionModal';

export default function ShopCategoriesPage() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal Tạo/Sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ShopCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');

  // State cho Modal thêm sản phẩm
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedCatIdForProduct, setSelectedCatIdForProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res: any = await ShopService.getSellerCategories();
      setCategories(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!categoryName.trim()) return;
    try {
      if (editingCategory) {
        await ShopService.updateCategory(editingCategory.id, { name: categoryName });
      } else {
        await ShopService.createCategory(categoryName);
      }
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setCategoryName('');
      fetchCategories();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Sản phẩm trong danh mục sẽ không bị xóa.')) return;
    try {
      await ShopService.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      alert('Không thể xóa danh mục');
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsEditModalOpen(true);
  };

  const openEditModal = (cat: ShopCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setIsEditModalOpen(true);
  };

  const openProductModal = (id: string) => {
    setSelectedCatIdForProduct(id);
    setIsProductModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Danh mục Shop</h1>
           <p className="text-sm text-gray-500">Tạo danh mục riêng để phân loại sản phẩm cho khách hàng dễ tìm kiếm</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <FiPlus /> Tạo danh mục mới
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="px-6 py-4">Tên danh mục</th>
              <th className="px-6 py-4 text-center">Số lượng sản phẩm</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : categories.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có danh mục nào</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                        {cat._count?.products || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cat.isActive ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">Hoạt động</span>
                    ) : (
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">Ẩn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                        onClick={() => openProductModal(cat.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded" 
                        title="Thêm sản phẩm"
                    >
                        <FiLayers size={18} />
                    </button>
                    <button 
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded" 
                        title="Sửa tên"
                    >
                        <FiEdit2 size={18} />
                    </button>
                    <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded" 
                        title="Xóa danh mục"
                    >
                        <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo/Sửa Danh mục */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
           <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h3 className="font-bold text-lg mb-4">
                  {editingCategory ? 'Sửa tên danh mục' : 'Tạo danh mục mới'}
              </h3>
              <input 
                 className="w-full border rounded p-2 mb-4 focus:border-brand-orange outline-none"
                 placeholder="Nhập tên danh mục (Ví dụ: Đồ hè, Giảm giá soc...)"
                 value={categoryName}
                 onChange={(e) => setCategoryName(e.target.value)}
                 autoFocus
              />
              <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                  <Button onClick={handleCreateOrUpdate}>Lưu</Button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Chọn Sản Phẩm */}
      {selectedCatIdForProduct && (
        <ProductSelectionModal 
            isOpen={isProductModalOpen}
            categoryId={selectedCatIdForProduct}
            onClose={() => setIsProductModalOpen(false)}
            onSuccess={fetchCategories}
        />
      )}
    </div>
  );
}