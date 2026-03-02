'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { InputGroup } from '@/components/ui/InputGroup';
import { AuthService } from '@/services/AuthService';
import { toast } from 'react-hot-toast';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
    }

    if (formData.newPassword.length < 6) {
        toast.error('Mật khẩu mới quá ngắn');
        return;
    }

    try {
        setLoading(true);
        await AuthService.changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        });
        toast.success('Đổi mật khẩu thành công!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h1>
        <p className="text-sm text-gray-500 mt-1">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
      </div>

      <div className="max-w-xl mx-auto py-4">
        <form className="space-y-2" onSubmit={handleSubmit}>
            <div className="grid grid-cols-12 gap-4 items-center mb-4">
                <label className="col-span-12 md:col-span-4 text-sm font-medium text-gray-600 md:text-right md:pr-4">Mật khẩu hiện tại</label>
                <div className="col-span-12 md:col-span-8">
                    <InputGroup 
                        label=""
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="mb-0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center mb-4">
                <label className="col-span-12 md:col-span-4 text-sm font-medium text-gray-600 md:text-right md:pr-4">Mật khẩu mới</label>
                <div className="col-span-12 md:col-span-8">
                    <InputGroup 
                        label=""
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu mới"
                        className="mb-0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center mb-6">
                <label className="col-span-12 md:col-span-4 text-sm font-medium text-gray-600 md:text-right md:pr-4">Xác nhận mật khẩu</label>
                <div className="col-span-12 md:col-span-8">
                    <InputGroup 
                        label=""
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu mới"
                        className="mb-0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="md:col-start-5 col-span-12 md:col-span-8">
                    <Button className="w-auto px-8" isLoading={loading}>Xác nhận</Button>
                    <p className="mt-4 text-xs text-gray-400 hover:text-brand-orange cursor-pointer transition-colors">Quên mật khẩu?</p>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}