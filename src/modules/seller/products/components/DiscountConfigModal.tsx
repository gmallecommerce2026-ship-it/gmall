// src/modules/seller/products/components/DiscountConfigModal.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import ToggleSwitch from '@/components/ui/ToggleSwitch'; // Đảm bảo component này hoạt động đúng props
import { Product, ProductVariant } from '@/types/product';
import { ProductService, DiscountPayload } from '@/services/product.service';
import { X, Calendar, AlertCircle } from 'lucide-react';
import classNames from 'classnames';

interface DiscountConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: () => void;
}

interface VariantDiscountForm {
  id: string;
  sku: string;
  originalPrice: number;
  discountValue: number;
  finalPrice: number;
  name: string;
}

interface DiscountFormValues {
  isDiscountActive: boolean;
  applyToAll: boolean;
  commonDiscountValue: number;
  discountStartDate: string;
  discountEndDate: string;
  variants: VariantDiscountForm[];
}

const DiscountConfigModal: React.FC<DiscountConfigModalProps> = ({
  isOpen, onClose, product, onSuccess
}) => {
  // Chấp nhận cả hai hình dạng (`name` của kênh người bán, `title` của cửa hàng) thay vì
  // ép một phía đổi theo phía kia — modal này có thể được dùng lại ở chỗ khác, và một
  // tiêu đề rỗng trên hộp thoại đổi GIÁ là thứ không được phép xảy ra lần nữa.
  const productName = (product as any)?.name || product?.title || '(không rõ tên)';

  const { register, handleSubmit, watch, setValue, control, reset, formState: { isSubmitting, errors } } = useForm<DiscountFormValues>({
    defaultValues: {
      isDiscountActive: false,
      applyToAll: true,
      commonDiscountValue: 0,
      variants: []
    }
  });

  const isDiscountActive = watch('isDiscountActive');
  const applyToAll = watch('applyToAll');
  const variants = watch('variants');

  // Helper: Lấy tên phân loại
  const getVariantName = (variant: ProductVariant) => {
    if (!product.tiers || !variant.tierIndex) return variant.sku || "Biến thể";
    const indices = Array.isArray(variant.tierIndex) ? variant.tierIndex : JSON.parse(variant.tierIndex as any);
    return product.tiers.map((tier, i) => tier.options[indices[i]]).join(" - ");
  };

  // hooks-fix wiki 0031: getVariantName là helper closure thuần — đọc product.tiers
  // mà product đã trong deps; thêm getVariantName gây re-render thừa. Disable rule.
  useEffect(() => {
    if (isOpen && product) {
      const formatDate = (dateStr?: string | null) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';

      const mappedVariants = (product.variants || []).map(v => ({
        id: v.id!,
        sku: v.sku || '',
        originalPrice: v.originalPrice || v.price,
        discountValue: v.discountValue || (product.discountValue || 0),
        finalPrice: v.price, // Lưu ý: Logic này có thể cần điều chỉnh tùy thuộc vào BE trả về giá đã giảm hay chưa
        name: getVariantName(v)
      }));

      // Tính toán lại finalPrice dựa trên discountValue nếu cần hiển thị đúng ngay lúc mở
      mappedVariants.forEach(v => {
          v.finalPrice = Math.round(v.originalPrice * (1 - v.discountValue / 100));
      });

      reset({
        isDiscountActive: product.isDiscountActive || false,
        applyToAll: true,
        commonDiscountValue: product.discountValue || 0,
        discountStartDate: formatDate(product.discountStartDate),
        discountEndDate: formatDate(product.discountEndDate),
        variants: mappedVariants
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, reset]);

  const handlePercentChange = (val: number, index?: number) => {
    let safeVal = val;
    if (safeVal > 100) safeVal = 100;
    if (safeVal < 0) safeVal = 0;

    if (index === undefined) {
      // Update All
      setValue('commonDiscountValue', safeVal);
      variants.forEach((v, i) => {
        setValue(`variants.${i}.discountValue`, safeVal);
        setValue(`variants.${i}.finalPrice`, Math.round(v.originalPrice * (1 - safeVal / 100)));
      });
    } else {
      // Update Specific
      const v = variants[index];
      setValue(`variants.${index}.discountValue`, safeVal);
      setValue(`variants.${index}.finalPrice`, Math.round(v.originalPrice * (1 - safeVal / 100)));
    }
  };

  const handlePriceChange = (newPrice: number, index: number) => {
    const v = variants[index];
    let safePrice = newPrice;
    if (safePrice > v.originalPrice) safePrice = v.originalPrice;
    if (safePrice < 0) safePrice = 0;

    let percent = 0;
    if (v.originalPrice > 0) {
      percent = Math.round(((v.originalPrice - safePrice) / v.originalPrice) * 100);
    }

    setValue(`variants.${index}.finalPrice`, safePrice);
    setValue(`variants.${index}.discountValue`, percent);
  };

  const onSubmit = async (data: DiscountFormValues) => {
    if (data.isDiscountActive) {
      if (!data.discountStartDate || !data.discountEndDate) {
        toast.error('Vui lòng chọn thời gian áp dụng');
        return;
      }
      if (new Date(data.discountStartDate) >= new Date(data.discountEndDate)) {
        toast.error('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
    }

    try {
      // wiki 0108 — hai lỗi cùng nằm ở khối này:
      //
      // 1. Trường phân loại phải tên `variants`, KHÔNG phải `variations`.
      //    `UpdateProductDiscountDto` khai `variants`, mà `ValidationPipe` chạy
      //    `whitelist: true` nên `variations` bị CẮT ÂM THẦM: API trả 200, giao diện
      //    báo "Cập nhật giảm giá thành công", còn DB thì `discountValue` của mọi
      //    phân loại vẫn nguyên 0. Người bán đặt giảm 50% rồi tin là đã xong.
      //
      // 2. Ngày rỗng phải BỎ HẲN khỏi payload, không gửi chuỗi ''.
      //    Khi tắt giảm giá thì khối kiểm ở trên được bỏ qua, và `formatDate(null)`
      //    trả '' → `@IsOptional()` chỉ bỏ qua `undefined`/`null` chứ KHÔNG bỏ qua
      //    chuỗi rỗng, nên '' rơi vào `@IsDateString()` → 400 "phải là ngày hợp lệ".
      //    Hậu quả: sản phẩm đã giảm giá thì KHÔNG TẮT ĐI ĐƯỢC nữa.
      const payload: DiscountPayload = {
        isDiscountActive: data.isDiscountActive,
        discountType: 'PERCENT',
        ...(data.discountStartDate ? { discountStartDate: data.discountStartDate } : {}),
        ...(data.discountEndDate ? { discountEndDate: data.discountEndDate } : {}),
        discountValue: data.applyToAll ? Number(data.commonDiscountValue) : 0,
        variants: data.variants.map(v => ({
          id: v.id,
          discountValue: data.applyToAll ? Number(data.commonDiscountValue) : Number(v.discountValue)
        }))
      };

      await ProductService.updateDiscount(product.id, payload);
      toast.success('Cập nhật giảm giá thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* --- 1. HEADER --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cài đặt giảm giá</h3>
            {/* Tên sản phẩm đến từ HAI nguồn có hình dạng KHÁC NHAU:
                  - Kênh người bán: lấy thẳng `/seller/products` → trường là `name`
                  - Cửa hàng      : qua `mapProductDetail` → đổi thành `title`
                Modal này chỉ đọc `title` nên ở kênh người bán luôn ra RỖNG — hộp thoại
                đổi GIÁ mà không cho biết đang sửa sản phẩm nào. TypeScript không bắt được
                vì `selectedProductForDiscount` khai kiểu `any`. */}
            <p className="text-sm text-gray-500 max-w-[400px] truncate" title={productName}>
                Sản phẩm: <span className="font-medium text-gray-700">{productName}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- 2. BODY --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* A. Toggle Kích hoạt */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">Kích hoạt giảm giá</span>
                    <span className="text-xs text-gray-500">Bật để áp dụng chương trình khuyến mãi cho sản phẩm này.</span>
                </div>
                <Controller
                    control={control}
                    name="isDiscountActive"
                    render={({ field: { value, onChange } }) => (
                        <ToggleSwitch checked={value} onChange={onChange} />
                    )}
                />
            </div>

            {/* Nội dung khi Active */}
            {isDiscountActive && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                
                {/* B. Chọn thời gian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày bắt đầu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="datetime-local"
                                {...register('discountStartDate')}
                                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:ring-orange-500 focus:border-orange-500 text-sm h-10"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày kết thúc</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="datetime-local"
                                {...register('discountEndDate')}
                                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:ring-orange-500 focus:border-orange-500 text-sm h-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                {/* C. Phạm vi áp dụng */}
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Cấu hình giá</label>
                    
                    {/* Chỉ hiện options nếu có variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="flex gap-4 mb-4">
                             <Controller
                                name="applyToAll"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <label 
                                            className={classNames(
                                                "flex-1 border rounded-lg p-3 cursor-pointer transition-all hover:border-orange-300 flex items-center gap-3",
                                                value ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" : "bg-white border-gray-200"
                                            )}
                                            onClick={() => onChange(true)}
                                        >
                                            <div className={classNames("w-4 h-4 rounded-full border flex items-center justify-center", value ? "border-orange-600" : "border-gray-400")}>
                                                {value && <div className="w-2 h-2 rounded-full bg-orange-600"></div>}
                                            </div>
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900">Áp dụng chung</span>
                                                <span className="block text-xs text-gray-500">Tất cả phân loại giảm giống nhau</span>
                                            </div>
                                        </label>

                                        <label 
                                             className={classNames(
                                                "flex-1 border rounded-lg p-3 cursor-pointer transition-all hover:border-orange-300 flex items-center gap-3",
                                                !value ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" : "bg-white border-gray-200"
                                            )}
                                            onClick={() => onChange(false)}
                                        >
                                            <div className={classNames("w-4 h-4 rounded-full border flex items-center justify-center", !value ? "border-orange-600" : "border-gray-400")}>
                                                {!value && <div className="w-2 h-2 rounded-full bg-orange-600"></div>}
                                            </div>
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900">Tùy chỉnh</span>
                                                <span className="block text-xs text-gray-500">Cài đặt riêng từng phân loại</span>
                                            </div>
                                        </label>
                                    </>
                                )}
                            />
                        </div>
                    )}

                    {/* D. Input Form */}
                    {applyToAll ? (
                        <div className="bg-orange-50/50 p-5 rounded-lg border border-orange-100 flex flex-col gap-2">
                             <label className="text-sm font-medium text-gray-800">Giảm giá chung (%)</label>
                             <div className="relative max-w-[200px]">
                                 <input 
                                    type="number" 
                                    className="w-full h-11 pl-4 pr-10 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-lg font-medium"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    {...register('commonDiscountValue')}
                                    onChange={(e) => handlePercentChange(Number(e.target.value))}
                                 />
                                 <span className="absolute right-4 top-3 text-gray-500 font-bold">%</span>
                             </div>
                             <p className="text-xs text-gray-500 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Giá trị này sẽ được áp dụng cho toàn bộ phân loại sản phẩm.
                             </p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3">Phân loại</th>
                                            <th className="px-4 py-3 text-right">Giá gốc</th>
                                            <th className="px-4 py-3 text-center w-[20%]">% Giảm</th>
                                            <th className="px-4 py-3 text-right w-[30%]">Sau giảm</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {variants.map((v, idx) => (
                                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {v.name}
                                                    <div className="text-[10px] text-gray-400 font-normal">{v.sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500">
                                                    {new Intl.NumberFormat('vi-VN').format(v.originalPrice)}₫
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="relative">
                                                        <input 
                                                            type="number"
                                                            value={v.discountValue}
                                                            min="0"
                                                            max="100"
                                                            onChange={(e) => handlePercentChange(Number(e.target.value), idx)}
                                                            className="w-full h-9 pl-2 pr-6 border border-gray-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-center font-medium"
                                                        />
                                                        <span className="absolute right-2 top-2.5 text-xs text-gray-400 font-bold">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                     <div className="relative">
                                                        <input 
                                                            type="number"
                                                            value={v.finalPrice}
                                                            onChange={(e) => handlePriceChange(Number(e.target.value), idx)}
                                                            className="w-full h-9 pl-2 pr-8 border border-gray-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-right font-medium text-orange-600"
                                                        />
                                                        <span className="absolute right-2 top-2.5 text-xs text-gray-400">₫</span>
                                                     </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* --- 3. FOOTER --- */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-gray-200">
                Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountConfigModal;