'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoucherService } from '@/services/voucher.service';
import { toast } from 'react-hot-toast';
import { FiSave, FiShoppingBag, FiLayers, FiPackage } from 'react-icons/fi';
import { CrossSellSelector as ProductSelector } from '@/modules/seller/products/components/CrossSellSelector';
import CategorySelector from '@/components/seller/CategorySelector'; 

export default function CreateVoucherClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'FIXED_AMOUNT',
    scope: 'SHOP',
    amount: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 100,
    startDate: '',
    endDate: '',
    productIds: [] as string[],
    categoryIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      if (formData.scope === 'PRODUCT' && !formData.productIds.length) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm');
      }
      if (formData.scope === 'CATEGORY' && !formData.categoryIds.length) {
        throw new Error('Vui lòng chọn ít nhất 1 danh mục');
      }

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : 0,
        usageLimit: Number(formData.usageLimit),
      };

      await VoucherService.createVoucher(payload);
      
      toast.success('Tạo Voucher thành công!');
      router.push('/seller-dashboard/promotions');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tạo Mã Giảm Giá Mới</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã Voucher</label>
            <input name="code" required onChange={handleChange} className="w-full border p-2 rounded uppercase font-bold" placeholder="SALE2024" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên chương trình</label>
            <input name="name" required onChange={handleChange} className="w-full border p-2 rounded" placeholder="Siêu sale..." />
          </div>
        </div>

        {/* Discount Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại giảm giá</label>
            <select name="type" onChange={handleChange} className="w-full border p-2 rounded">
              <option value="FIXED_AMOUNT">Số tiền (VNĐ)</option>
              <option value="PERCENTAGE">Phần trăm (%)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Giá trị giảm</label>
            <input type="number" name="amount" required min="0" onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-sm font-medium">Đơn tối thiểu</label>
             <input type="number" name="minOrderValue" min="0" onChange={handleChange} className="w-full border p-2 rounded" defaultValue={0}/>
           </div>
           <div className="space-y-2">
              <label className="text-sm font-medium">Giảm tối đa (Max Cap)</label>
              <input type="number" name="maxDiscount" min="0" onChange={handleChange} className="w-full border p-2 rounded" placeholder="0 = Không giới hạn" />
           </div>
        </div>

        {/* PHẠM VI ÁP DỤNG */}
        <div>
          <label className="block font-medium mb-3">Phạm vi áp dụng</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`border p-4 rounded cursor-pointer flex flex-col items-center gap-2 transition ${formData.scope === 'SHOP' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="scope" value="SHOP" checked={formData.scope === 'SHOP'} onChange={handleChange} className="hidden" />
              <FiShoppingBag size={24} className="text-blue-600" />
              <span className="font-semibold text-sm">Toàn Shop</span>
            </label>
            <label className={`border p-4 rounded cursor-pointer flex flex-col items-center gap-2 transition ${formData.scope === 'PRODUCT' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="scope" value="PRODUCT" checked={formData.scope === 'PRODUCT'} onChange={handleChange} className="hidden" />
              <FiPackage size={24} className="text-purple-600" />
              <span className="font-semibold text-sm">Sản Phẩm</span>
            </label>
            <label className={`border p-4 rounded cursor-pointer flex flex-col items-center gap-2 transition ${formData.scope === 'CATEGORY' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="scope" value="CATEGORY" checked={formData.scope === 'CATEGORY'} onChange={handleChange} className="hidden" />
              <FiLayers size={24} className="text-green-600" />
              <span className="font-semibold text-sm">Danh Mục</span>
            </label>
          </div>
        </div>

        {/* SELECTORS */}
        {formData.scope === 'PRODUCT' && (
          <div className="mt-4 border-t pt-4">
            <ProductSelector selectedIds={formData.productIds} onChange={(ids) => setFormData(prev => ({...prev, productIds: ids}))} />
          </div>
        )}
        {formData.scope === 'CATEGORY' && (
          <div className="mt-4 border-t pt-4">
            <CategorySelector selectedIds={formData.categoryIds} onChange={(ids) => setFormData(prev => ({...prev, categoryIds: ids}))} />
          </div>
        )}

        {/* Time & Limit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
             <label className="text-sm font-medium">Số lượng mã</label>
             <input type="number" name="usageLimit" required min="1" onChange={handleChange} className="w-full border p-2 rounded" defaultValue={100} />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Ngày bắt đầu</label>
             <input type="datetime-local" name="startDate" required onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Ngày kết thúc</label>
             <input type="datetime-local" name="endDate" required onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 mt-6">
          {loading ? 'Đang xử lý...' : 'Xác nhận tạo Voucher'}
        </button>
      </form>
    </div>
  );
}