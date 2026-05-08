// src/app/(routes)/gift-payment/edit/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import Button from '@/components/ui/Button';

export default function GiftPaymentEditClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'sender' | 'receiver'; // Lấy loại cần sửa từ URL

  const { senderInfo, receiverInfo, setSenderInfo, setReceiverInfo } = useCheckoutStore();
  
  // State form cục bộ
  const [formData, setFormData] = useState<any>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load data từ Store khi mount/đổi type
  // hooks-fix wiki 0031: disable set-state-in-effect — sync store→form chỉ chạy khi
  // type/store thay đổi, hành vi đúng ý đồ; không thể chuyển sang derived state vì
  // form còn được edit local (formData).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (type === 'sender') setFormData({ ...senderInfo });
    else if (type === 'receiver') setFormData({ ...receiverInfo });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [type, senderInfo, receiverInfo]);

  // Xử lý thay đổi input
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Logic nút Back
  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("Bạn có thay đổi chưa lưu. Bạn có muốn lưu lại trước khi thoát không?");
      if (confirmLeave) {
        handleSave();
        return;
      }
    }
    router.back();
  };

  // Logic Lưu
  const handleSave = () => {
    if (type === 'sender') setSenderInfo(formData);
    else setReceiverInfo(formData);
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-start pt-10">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b pb-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
             {/* Icon mũi tên quay lại */}
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa thông tin {type === 'sender' ? 'Người Tặng' : 'Người Nhận'}
          </h1>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Họ và tên</label>
            <input 
              value={formData.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)}
              className="border p-3 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Số điện thoại</label>
            <input 
              value={formData.phone || ''} 
              onChange={(e) => handleChange('phone', e.target.value)}
              className="border p-3 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Mối quan hệ</label>
            <input 
              value={formData.relation || ''} 
              onChange={(e) => handleChange('relation', e.target.value)}
              className="border p-3 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Địa chỉ chi tiết</label>
            <textarea 
              value={formData.address || ''} 
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              className="border p-3 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none resize-none"
            />
          </div>

          {type === 'receiver' && (
             <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Lời nhắn</label>
                <textarea 
                  value={formData.message || ''} 
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={4}
                  className="border p-3 rounded-lg bg-orange-50/30 border-orange-200 focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                />
             </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-10">
          <Button variant="secondary" onClick={handleBack}>Hủy bỏ</Button>
          <Button variant="primary" onClick={handleSave} className="shadow-lg shadow-orange-200">Lưu thông tin</Button>
        </div>

      </div>
    </div>
  );
}