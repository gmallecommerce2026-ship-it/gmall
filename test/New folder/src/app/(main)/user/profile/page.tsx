'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { InputGroup } from '@/components/ui/InputGroup'; // Sử dụng component có sẵn của bạn
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    username: 'nguyenvana123',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0912345678',
    gender: 'male',
    dob: '1995-10-20'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Form Section */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Tên đăng nhập</label>
            <div className="col-span-12 md:col-span-9">
               <span className="text-gray-800 font-medium">{formData.username}</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Tên</label>
            <div className="col-span-12 md:col-span-9">
              <InputGroup 
                label="" 
                value={formData.name} 
                name="name"
                onChange={handleChange}
                className="mb-0" 
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Email</label>
            <div className="col-span-12 md:col-span-9">
               <span className="text-gray-800">{formData.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Số điện thoại</label>
            <div className="col-span-12 md:col-span-9">
               <span className="text-gray-800">{formData.phone}</span>
               <button className="ml-2 text-brand-orange text-sm font-medium hover:underline">Thay đổi</button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Giới tính</label>
            <div className="col-span-12 md:col-span-9 flex gap-4">
              {['male', 'female', 'other'].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="accent-brand-orange w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Ngày sinh</label>
            <div className="col-span-12 md:col-span-9">
                <input 
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-gray-700"
                />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mt-6">
             <div className="md:col-start-4 col-span-12 md:col-span-9">
                <Button className="w-auto px-8">Lưu</Button>
             </div>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="md:w-72 flex flex-col items-center justify-center border-l border-gray-100 md:pl-8">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 mb-4">
                    <img 
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white w-8 h-8" />
                </div>
            </div>
            
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors mb-3">
                Chọn ảnh
            </button>
            
            <div className="text-xs text-gray-400 text-center">
                <p>Dụng lượng file tối đa 1 MB</p>
                <p>Định dạng: .JPEG, .PNG</p>
            </div>
        </div>
      </div>
    </div>
  );
}