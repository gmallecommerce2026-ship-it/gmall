'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/services/AdminService';
import { CreateUserDto, UserRole } from '@/types/admin';
import Button from '@/components/ui/Button';
import { InputGroup } from '@/components/ui/InputGroup';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function CreateUserClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'USER', // Default role
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Vui lòng nhập tên hiển thị';
    if (!formData.username?.trim() && !formData.email?.trim()) {
      return 'Phải nhập ít nhất Username hoặc Email';
    }
    if (formData.password.length < 6) return 'Mật khẩu phải từ 6 ký tự trở lên';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    // Clean data: gửi undefined nếu string rỗng để backend xử lý đúng
    const payload = {
      ...formData,
      username: formData.username?.trim() || undefined,
      email: formData.email?.trim() || undefined,
    };

    try {
      setLoading(true);
      await AdminService.createUser(payload);
      toast.success('Tạo người dùng thành công!');
      router.push('/admin/users'); // Redirect về danh sách
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <FiArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Thêm người dùng mới</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <InputGroup
            label="Tên hiển thị (Name)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <InputGroup
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="user123"
            />

            {/* Email */}
            <InputGroup
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
            />
          </div>
          <p className="text-xs text-gray-500 italic -mt-3">* Bắt buộc nhập Username hoặc Email</p>

          {/* Password */}
          <InputGroup
            label="Mật khẩu"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            required
          />

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="USER">Người mua (USER)</option>
              <option value="SELLER">Người bán (SELLER)</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Button 
               variant="outline" 
               type="button" 
               onClick={() => router.push('/admin/users')}
             >
               Hủy bỏ
             </Button>
             <Button 
               variant="primary" 
               type="submit" 
               isLoading={loading}
               leftIcon={<FiSave />}
             >
               Tạo mới
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}