'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateVoucherPayload, VoucherService } from '@/services/voucher.service';
import { toast } from 'react-hot-toast';
import { FiShoppingBag, FiLayers, FiPackage, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import Image from 'next/image';
import CategorySelector from '@/components/seller/CategorySelector'; 
import ProductPickerModal from '@/components/seller/ProductPickerModal'; // Import modal mới

// Định nghĩa kiểu dữ liệu cho sản phẩm hiển thị preview
interface ProductPreview {
  id: string;
  name: string;
  images: string[];
  price: number;
}

export default function CreateVoucherClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // State lưu danh sách sản phẩm đầy đủ để hiển thị (thay vì chỉ lưu ID)
  const [selectedProducts, setSelectedProducts] = useState<ProductPreview[]>([]);

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
    categoryIds: [] as string[],
    // productIds sẽ được lấy từ selectedProducts khi submit
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.code?.trim()) throw new Error('Vui lòng nhập mã voucher');
      if (!formData.startDate) throw new Error('Vui lòng chọn ngày bắt đầu');
      if (!formData.endDate) throw new Error('Vui lòng chọn ngày kết thúc');

      const now = new Date();
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      // audit Seller #25: ngày kết thúc trong quá khứ vẫn được submit. Check vs now().
      if (end <= now) throw new Error('Ngày kết thúc phải sau thời điểm hiện tại');
      if (end <= start) throw new Error('Ngày kết thúc phải sau ngày bắt đầu');

      if (formData.scope === 'PRODUCT' && !selectedProducts.length) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm');
      }
      if (formData.scope === 'CATEGORY' && !formData.categoryIds.length) {
        throw new Error('Vui lòng chọn ít nhất 1 danh mục');
      }

      const payload: CreateVoucherPayload = {
        ...formData,
        // Ép kiểu string sang Union Type
        type: formData.type as 'FIXED_AMOUNT' | 'PERCENTAGE',
        scope: formData.scope as 'SHOP' | 'PRODUCT' | 'CATEGORY',
        
        // Convert số
        amount: Number(formData.amount),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : 0,
        usageLimit: Number(formData.usageLimit),
        
        // Map ID từ selectedProducts (nếu bạn đã dùng code mới của tôi ở câu trước)
        productIds: selectedProducts.map(p => p.id), 
        // Hoặc giữ nguyên nếu chưa đổi state: productIds: formData.productIds
      };

      await VoucherService.createVoucher(payload);
      
      toast.success('Tạo Voucher thành công!');
      router.push('/seller-dashboard/promotions');
    } catch (error: any) {
      console.error(error);
      // BE i18n pipe (wiki 0055) có thể trả message dạng array khi nhiều lỗi
      // validation; flatten về string cho toast.
      const raw = error?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join('\n') : (raw || error.message || 'Có lỗi xảy ra');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hàm xóa sản phẩm khỏi danh sách đã chọn
  const removeProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20"> {/* Tăng max-w để thoáng hơn */}
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tạo Mã Giảm Giá Mới</h1>
          <button type="button" onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">Thoát</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Thông tin cơ bản */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mã Voucher <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input name="code" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg uppercase font-bold tracking-wider focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Vd: SUMMER2024" maxLength={20} />
                    <span className="absolute right-3 top-3 text-xs text-gray-400 font-normal">Tối đa 20 ký tự</span>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tên chương trình <span className="text-red-500">*</span></label>
                <input name="name" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Vd: Siêu sale chào hè..." />
            </div>
            </div>
        </div>

        {/* Card 2: Thiết lập giảm giá */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Thiết lập giảm giá</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Loại giảm giá</label>
                    <select name="type" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="FIXED_AMOUNT">Giảm theo số tiền (VNĐ)</option>
                        <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Giá trị giảm</label>
                    <div className="relative">
                        <input type="number" name="amount" required min="0" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-4" placeholder="0"/>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Đơn hàng tối thiểu</label>
                <input type="number" name="minOrderValue" min="0" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={0}/>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Giảm tối đa (Nếu theo %)</label>
                <input type="number" name="maxDiscount" min="0" onChange={handleChange} disabled={formData.type === 'FIXED_AMOUNT'} className={`w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${formData.type === 'FIXED_AMOUNT' ? 'bg-gray-100 text-gray-400' : ''}`} placeholder="Nhập 0 nếu không giới hạn" />
            </div>
            </div>
        </div>

        {/* Card 3: PHẠM VI ÁP DỤNG (Main logic changes here) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Phạm vi áp dụng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { val: 'SHOP', icon: FiShoppingBag, label: 'Toàn Shop', color: 'blue' },
                    { val: 'PRODUCT', icon: FiPackage, label: 'Sản Phẩm', color: 'purple' },
                    { val: 'CATEGORY', icon: FiLayers, label: 'Danh Mục', color: 'green' }
                ].map((item) => (
                    <label key={item.val} className={`relative border-2 p-4 rounded-xl cursor-pointer flex flex-col items-center gap-3 transition-all duration-200 ${formData.scope === item.val ? `border-${item.color}-500 bg-${item.color}-50 shadow-md` : 'border-gray-100 hover:bg-gray-50 hover:border-gray-300'}`}>
                        <input type="radio" name="scope" value={item.val} checked={formData.scope === item.val} onChange={handleChange} className="hidden" />
                        <item.icon size={28} className={formData.scope === item.val ? `text-${item.color}-600` : 'text-gray-400'} />
                        <span className={`font-bold text-sm ${formData.scope === item.val ? `text-${item.color}-700` : 'text-gray-600'}`}>{item.label}</span>
                        {formData.scope === item.val && <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-${item.color}-500`}></div>}
                    </label>
                ))}
            </div>

            {/* PRODUCT SELECTOR LOGIC MỚI */}
            {formData.scope === 'PRODUCT' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-700">Sản phẩm áp dụng ({selectedProducts.length})</span>
                        <button 
                            type="button" 
                            onClick={() => setIsProductModalOpen(true)}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium text-sm shadow-sm"
                        >
                            <FiPlus /> Thêm sản phẩm
                        </button>
                    </div>

                    {selectedProducts.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                            <p className="text-gray-500 mb-2">Chưa có sản phẩm nào được chọn</p>
                            <button type="button" onClick={() => setIsProductModalOpen(true)} className="text-purple-600 font-medium hover:underline">Chọn sản phẩm ngay</button>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium">
                                    <tr>
                                        <th className="p-3">Sản phẩm</th>
                                        <th className="p-3 text-right">Giá bán</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {selectedProducts.map((p) => (
                                        <tr key={p.id} className="group hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 relative border rounded bg-white flex-shrink-0">
                                                        {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover rounded-sm" />}
                                                    </div>
                                                    <span className="line-clamp-1 font-medium text-gray-800">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right font-medium">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                            </td>
                                            <td className="p-3 text-right">
                                                <button type="button" onClick={() => removeProduct(p.id)} className="text-gray-400 hover:text-red-500 p-2 transition">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {formData.scope === 'CATEGORY' && (
                <div className="mt-4 border-t pt-4 animate-in fade-in">
                    <CategorySelector selectedIds={formData.categoryIds} onChange={(ids) => setFormData(prev => ({...prev, categoryIds: ids}))} />
                </div>
            )}
        </div>

        {/* Card 4: Thời gian & Giới hạn */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Thời gian & Giới hạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Số lượng mã tối đa</label>
                    <input type="number" name="usageLimit" required min="1" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={100} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                    <input type="datetime-local" name="startDate" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                    <input type="datetime-local" name="endDate" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
        </div>
        
        {/* Submit Actions */}
        <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-lg font-bold hover:bg-gray-200 transition">
                Hủy bỏ
            </button>
            <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-bold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Đang xử lý...' : 'Xác nhận tạo Voucher'}
            </button>
        </div>
      </form>

      {/* Render Modal ở ngoài form */}
      <ProductPickerModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialSelectedIds={selectedProducts.map(p => p.id)}
        onConfirm={(products: any[]) => {
            // Merge products mới vào list, tránh trùng lặp nếu cần thiết (dù modal đã handle logic chọn)
            // Vì onConfirm trả về danh sách full các item đã check trong modal
            setSelectedProducts(products);
        }}
      />
    </div>
  );
}