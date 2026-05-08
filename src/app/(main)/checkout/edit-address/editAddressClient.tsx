"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthInput, PrimaryButton } from "@/components/auth/AuthComponents";
import { toast, Toaster } from "react-hot-toast";
import { useCheckoutStore, UserInfo } from "@/store/useCheckoutStore"; // Import Store chuẩn

export default function EditAddressClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy các params điều hướng
  const backUrl = searchParams.get('backUrl') || '/payment';
  const type = searchParams.get('type') as 'buyer' | 'sender' | 'receiver' || 'buyer';

  // Lấy state và actions từ Store
  const { senderInfo, receiverInfo, buyerInfo, setSenderInfo, setReceiverInfo, setBuyerInfo } = useCheckoutStore();

  // Local state form
  const [formData, setFormData] = useState<UserInfo>({
    name: "", phone: "", address: "", email: "", message: "", relation: ""
  });

  // Load dữ liệu từ Store vào Form khi `type` thay đổi
  // hooks-fix wiki 0031: chỉ sync khi đổi type → giữ ý đồ "không reset form khi user đang edit".
  // Disable exhaustive-deps cho store info; nếu thêm sẽ ghi đè input của user.
  useEffect(() => {
    // Dùng kỹ thuật Hydration safe cho Zustand trong Next.js
    useCheckoutStore.persist.rehydrate();

    let currentData: UserInfo;
    if (type === 'sender') currentData = senderInfo;
    else if (type === 'receiver') currentData = receiverInfo;
    else currentData = buyerInfo;

    setFormData(currentData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleChange = (field: keyof UserInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAndBack = () => {
    // Validate cơ bản (Client side validation)
    if (!formData.name || !formData.phone || !formData.address) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
    }

    // Save vào Store (Sync ngay lập tức)
    if (type === 'sender') setSenderInfo(formData);
    else if (type === 'receiver') setReceiverInfo(formData);
    else setBuyerInfo(formData);

    toast.success("Đã lưu thông tin");
    
    // Quay lại trang trước
    router.push(backUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" />
      
      {/* Container giới hạn chiều rộng để tập trung sự chú ý */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 md:p-10 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center flex-1">
            {type === 'buyer' && "Địa chỉ nhận hàng"}
            {type === 'sender' && "Thông tin người tặng"}
            {type === 'receiver' && "Thông tin người nhận"}
          </h1>
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AuthInput 
                    label="Họ và tên" 
                    placeholder="Nhập họ tên"
                    value={formData.name} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                />
                
                <AuthInput 
                    label="Số điện thoại" 
                    placeholder="Nhập SĐT"
                    value={formData.phone} 
                    onChange={(e) => handleChange('phone', e.target.value)} 
                />
            </div>

            {/* Chỉ hiện Email & Relation cho Sender/Receiver */}
            {type !== 'buyer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AuthInput 
                        label="Mối quan hệ" 
                        placeholder="VD: Bạn bè, Đồng nghiệp"
                        value={formData.relation || ''} 
                        onChange={(e) => handleChange('relation', e.target.value)} 
                    />
                     <AuthInput 
                        label="Email (Tuỳ chọn)" 
                        placeholder="email@example.com"
                        value={formData.email || ''} 
                        onChange={(e) => handleChange('email', e.target.value)} 
                    />
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label className="font-medium text-base text-black">Địa chỉ chi tiết</label>
                <textarea 
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all min-h-[100px] resize-none"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                />
            </div>

            {/* Đã ẩn Map theo yêu cầu */}
            {/* <div className="hidden">Map Component would be here</div> */}

            {type === 'receiver' && (
                <div className="flex flex-col gap-2 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <label className="font-medium text-base text-brand-orange">💌 Lời nhắn gửi yêu thương</label>
                    <textarea 
                        className="w-full bg-white border border-orange-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-brand-orange min-h-[120px]"
                        value={formData.message || ''}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Viết lời chúc của bạn ở đây..."
                    />
                </div>
            )}
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <PrimaryButton onClick={handleSaveAndBack}>
            Xác nhận thay đổi
          </PrimaryButton>
        </div>

      </div>
    </div>
  );
}