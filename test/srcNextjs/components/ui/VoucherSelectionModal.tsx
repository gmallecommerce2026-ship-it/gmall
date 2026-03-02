// src/components/ui/VoucherSelectionModal.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { Voucher, VoucherService } from '@/services/voucher.service'; // Import từ service chính
import { toast } from 'react-hot-toast';
import { CloseIcon } from '@/icons';

interface VoucherSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Bỏ prop vouchers cũ, thay bằng các prop logic mới
  shopId?: string; 
  isSystem?: boolean;
  subtotal?: number; // Dùng để tính toán xem voucher có khả dụng không
  
  selectedId?: string | null; // Có thể null
  onSelect: (voucher: Voucher) => void; // Trả về cả object voucher thay vì chỉ ID
}

const VoucherSelectionModal: React.FC<VoucherSelectionModalProps> = ({
  isOpen,
  onClose,
  shopId,
  isSystem,
  subtotal = 0,
  selectedId,
  onSelect,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // 1. Fetch dữ liệu khi Modal mở
  useEffect(() => {
    if (isOpen) {
        setIsVisible(true);
        fetchVouchers();
    } else {
        setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen, shopId, isSystem]);

  const fetchVouchers = async () => {
    try {
        setLoading(true);
        let data: Voucher[] = [];

        if (isSystem) {
            // Gọi API lấy voucher sàn (bạn cần đảm bảo method này tồn tại hoặc dùng getMyVouchers lọc scope GLOBAL)
            const res = await VoucherService.getSystemVouchers();
            // Nếu API trả về cấu trúc khác, hãy map lại ở đây. Ví dụ: res.data hoặc res
            data = Array.isArray(res) ? res : []; 
        } else if (shopId) {
            // Gọi API lấy voucher shop
            // Lưu ý: service getShopVouchersPublic của bạn đang trả về [], cần backend implement
            // Tạm thời gọi getMyVouchers rồi lọc shopId để demo logic
            const allMyVouchers = await VoucherService.getMyVouchers(); 
            // Mock logic lọc (sửa lại theo logic backend thực tế của bạn)
            data = allMyVouchers.filter(v => v.scope === 'SHOP' && v.seller?.shopName /* check shopId here */);
            
            // Nếu chưa có backend, giả lập data để test UI:
            if(data.length === 0) {
               data = [
                   { id: 'v1', code: 'SHOP50K', name: 'Giảm 50k shop', type: 'FIXED_AMOUNT', amount: 50000, minOrderValue: 0, isActive: true, startDate: '', endDate: '', usageLimit: 100, usageCount: 0, scope: 'SHOP' },
                   { id: 'v2', code: 'SHOP10%', name: 'Giảm 10% shop', type: 'PERCENTAGE', amount: 10, minOrderValue: 100000, isActive: true, startDate: '', endDate: '', usageLimit: 100, usageCount: 0, scope: 'SHOP' }
               ];
            }
        }
        
        // Map data để đảm bảo có field discountValue (fix lỗi 1 ở runtime)
        const mappedData = data.map(v => ({
            ...v,
            discountValue: v.amount, // Map amount sang discountValue
        }));

        setVouchers(mappedData);
    } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách voucher");
    } finally {
        setLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ease-out ${isOpen ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}`}>
      <div className={`bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl z-10">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            {isSystem ? 'G-Mall Voucher' : 'Voucher của Shop'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50 space-y-4">
          {loading ? (
             <div className="text-center py-10 text-gray-400">Đang tải voucher...</div>
          ) : vouchers.length === 0 ? (
             <div className="text-center py-10 text-gray-400">Chưa có voucher nào khả dụng</div>
          ) : (
             vouchers.map((voucher) => {
                const isSelected = selectedId === voucher.id;
                const isDisabled = subtotal < voucher.minOrderValue; // Logic check điều kiện

                return (
                  <div
                    key={voucher.id}
                    onClick={() => !isDisabled && onSelect(voucher)}
                    className={`
                      relative p-4 rounded-2xl border-2 transition-all duration-200 group flex justify-between items-center select-none
                      ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-100 grayscale' : 'cursor-pointer'}
                      ${isSelected ? 'border-brand-orange bg-orange-50/50 shadow-md scale-[1.02]' : 'border-white bg-white hover:border-gray-200'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Left Ticket Stub */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${isSelected ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {voucher.type === 'PERCENTAGE' ? '%' : '₫'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-lg">{voucher.code}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{voucher.name}</span>
                        <span className="text-sm font-bold text-brand-orange mt-0.5">
                           {voucher.type === 'PERCENTAGE' ? `Giảm ${voucher.amount}%` : `Giảm ${voucher.amount.toLocaleString()}đ`}
                        </span>
                        {isDisabled && <span className="text-[10px] text-red-500 mt-1">Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ</span>}
                      </div>
                    </div>
                    
                    {/* Radio Button */}
                    {!isDisabled && (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'}`}>
                           <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0'}`} />
                        </div>
                    )}
                  </div>
                );
             })
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherSelectionModal;