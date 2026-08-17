'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { InputGroup } from '@/components/ui/InputGroup';
import { Camera } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { AuthService } from '@/services/AuthService';
import { toast } from 'react-hot-toast'; // Giả sử bạn có thư viện toast, nếu chưa thì dùng alert

export default function ProfilePage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'other',
    dob: ''
  });

  // Sync data từ Store vào Form khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '', // Type casting nếu User interface chưa có phone
        gender: (user as any).gender || 'other',
        dob: (user as any).dob ? new Date((user as any).dob).toISOString().split('T')[0] : ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // TS-fix wiki 0031: gender từ form là string -> narrow về union literal hợp lệ
      await AuthService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender as 'male' | 'female' | 'other',
        dob: formData.dob
      });
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Upload ảnh
      const res = await AuthService.uploadAvatar(file);
      // [FIX wiki 0095/0099/0103] `res?.` ở nhánh sau đã có, nhưng `res.data` phía trước thì
      // chưa → response `null`/rỗng vẫn ném TypeError trước khi tới nhánh dự phòng.
      const avatarUrl = res?.data?.url || res?.url; // Tùy cấu trúc trả về
      
      // 2. Update profile với avatar mới
      await AuthService.updateProfile({ avatar: avatarUrl });
      toast.success('Đổi ảnh đại diện thành công!');
    } catch (error) {
        toast.error('Lỗi upload ảnh');
    }
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
          {/* Username (Read-only) */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Email</label>
            <div className="col-span-12 md:col-span-9">
               <span className="text-gray-800 font-medium">{formData.email}</span>
               <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Đã xác minh</span>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Tên hiển thị</label>
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

          {/* Phone */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-12 md:col-span-3 text-sm font-medium text-gray-600 text-right md:pr-4">Số điện thoại</label>
            <div className="col-span-12 md:col-span-9">
               <InputGroup 
                label="" 
                value={formData.phone} 
                name="phone"
                onChange={handleChange}
                className="mb-0" 
              />
            </div>
          </div>

          {/* Gender */}
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

          {/* DOB */}
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
                <Button className="w-auto px-8" onClick={handleSubmit} isLoading={loading}>Lưu</Button>
             </div>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="md:w-72 flex flex-col items-center justify-center border-l border-gray-100 md:pl-8">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 mb-4">
                    <img 
                        src={user?.avatar || "https://i.pravatar.cc/150?u=default"} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white w-8 h-8" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
            </div>
            
            <label className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors mb-3 cursor-pointer">
                Chọn ảnh
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
            
            <div className="text-xs text-gray-400 text-center">
                <p>Dụng lượng file tối đa 1 MB</p>
                <p>Định dạng: .JPEG, .PNG</p>
            </div>
        </div>
      </div>
    </div>
  );
}