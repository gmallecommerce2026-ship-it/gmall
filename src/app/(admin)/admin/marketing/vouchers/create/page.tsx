'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoucherService } from '@/services/voucher.service';
import { FiArrowLeft, FiSave, FiGlobe, FiPackage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ProductSelector from '@/components/admin/marketing/ProductSelector'; // Import component vừa tạo

export default function CreateSystemVoucherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'FIXED_AMOUNT',
    scope: 'GLOBAL', // Mặc định là GLOBAL
    productIds: [] as string[], // Danh sách ID sản phẩm
    amount: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 1000,
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    if (formData.scope === 'PRODUCT' && formData.productIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    setLoading(true);
    try {
      await VoucherService.createSystemVoucher({
        ...formData,
        // scope đã có trong formData
      });
      toast.success('Tạo Voucher thành công!');
      router.push('/admin/marketing/vouchers');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['amount', 'minOrderValue', 'maxDiscount', 'usageLimit'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Tạo Voucher Sàn Mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="font-semibold text-lg border-b pb-2">Thông tin cơ bản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mã Voucher <span className="text-red-500">*</span></label>
                <input name="code" required onChange={handleChange} className="w-full border p-2.5 rounded-lg uppercase font-bold" placeholder="SALE2024" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên chương trình <span className="text-red-500">*</span></label>
                <input name="name" required onChange={handleChange} className="w-full border p-2.5 rounded-lg" placeholder="Siêu sale..." />
              </div>
            </div>

            {/* PHẠM VI ÁP DỤNG (SCOPE) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phạm vi áp dụng</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border p-4 rounded-lg cursor-pointer flex items-center gap-3 transition ${formData.scope === 'GLOBAL' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="scope" 
                    value="GLOBAL" 
                    checked={formData.scope === 'GLOBAL'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FiGlobe size={20} />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">Toàn Sàn</span>
                    <span className="text-xs text-gray-500">Áp dụng cho mọi đơn hàng</span>
                  </div>
                </label>

                <label className={`border p-4 rounded-lg cursor-pointer flex items-center gap-3 transition ${formData.scope === 'PRODUCT' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="scope" 
                    value="PRODUCT" 
                    checked={formData.scope === 'PRODUCT'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FiPackage size={20} />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">Sản phẩm</span>
                    <span className="text-xs text-gray-500">Chỉ áp dụng sp được chọn</span>
                  </div>
                </label>
              </div>
            </div>

            {/* PRODUCT SELECTOR (Chỉ hiện khi chọn PRODUCT) */}
            {formData.scope === 'PRODUCT' && (
              <ProductSelector 
                selectedIds={formData.productIds}
                onChange={(ids) => setFormData(prev => ({ ...prev, productIds: ids }))}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Settings */}
        <div className="space-y-6">
           {/* Discount Settings */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-lg border-b pb-2">Mức giảm</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại giảm giá</label>
                <select name="type" onChange={handleChange} className="w-full border p-2 rounded-lg">
                  <option value="FIXED_AMOUNT">Số tiền (VNĐ)</option>
                  <option value="PERCENTAGE">Phần trăm (%)</option>
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Giá trị giảm</label>
                 <input type="number" name="amount" required min="0" onChange={handleChange} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Đơn tối thiểu</label>
                 <input type="number" name="minOrderValue" min="0" onChange={handleChange} className="w-full border p-2 rounded-lg" defaultValue={0}/>
              </div>
              {formData.type === 'PERCENTAGE' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giảm tối đa</label>
                  <input type="number" name="maxDiscount" min="0" onChange={handleChange} className="w-full border p-2 rounded-lg" />
                </div>
              )}
           </div>

           {/* Time & Limit */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-lg border-b pb-2">Thời gian & Giới hạn</h2>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Số lượng mã</label>
                 <input type="number" name="usageLimit" required min="1" onChange={handleChange} className="w-full border p-2 rounded-lg" defaultValue={1000} />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Ngày bắt đầu</label>
                 <input type="datetime-local" name="startDate" required onChange={handleChange} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Ngày kết thúc</label>
                 <input type="datetime-local" name="endDate" required onChange={handleChange} className="w-full border p-2 rounded-lg" />
              </div>
           </div>

           <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
          >
            {loading ? 'Đang xử lý...' : <><FiSave /> Tạo Voucher</>}
          </button>
        </div>

      </form>
    </div>
  );
}