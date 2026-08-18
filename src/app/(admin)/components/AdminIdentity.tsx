'use client';

// wiki 0108: góc phải header khu quản trị trước đây in cứng "Admin User / Super Admin"
// cho MỌI người đăng nhập. Prod đang có 5 tài khoản ADMIN thật (cộng thêm tài khoản QA),
// nên người đang ngồi trước màn hình không có cách nào biết mình đang thao tác dưới danh
// nghĩa ai — với một khu vực sửa được giá, duyệt được shop và xử lý được tiền thì đó là
// thông tin phải đúng.
//
// Layout `(admin)` là Server Component (nó khai `metadata`), không đọc được store, nên
// phần danh tính tách thành client component nhỏ này.

import React from 'react';
import { useUserStore } from '@/store/useUserStore';

const initialsOf = (nameOrEmail: string) =>
  nameOrEmail
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'AD';

const AdminIdentity: React.FC = () => {
  const user = useUserStore((s) => s.user);

  // Trước khi store hydrate xong thì chưa biết là ai — hiện khung chờ trung tính thay vì
  // đoán bừa một cái tên.
  const label = user?.name || user?.email || null;
  const role = user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role || '';

  return (
    <div className="flex items-center gap-2 cursor-default p-1.5 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
        {label ? initialsOf(label) : '…'}
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-700 leading-none">{label ?? 'Đang tải…'}</p>
        <p className="text-[10px] text-gray-400">{label ? role : ''}</p>
      </div>
    </div>
  );
};

export default AdminIdentity;
