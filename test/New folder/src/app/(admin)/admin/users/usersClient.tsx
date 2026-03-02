// src/app/(admin)/admin/users/page.tsx
'use client';

import React, { useState } from 'react';
import { FiSearch, FiFilter, FiMoreVertical, FiLock, FiUnlock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

// Mock Data
const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Buyer', status: 'active', joinDate: '12/12/2024', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Seller', status: 'active', joinDate: '10/11/2024', avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@outlook.com', role: 'Buyer', status: 'locked', joinDate: '05/12/2024', avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=random' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@yahoo.com', role: 'Seller', status: 'pending', joinDate: '14/12/2025', avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=random' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', role: 'Admin', status: 'active', joinDate: '01/01/2024', avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+E&background=random' },
];

export default function UsersClient() {
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      locked: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm">Xem và quản lý tất cả tài khoản trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            <FiFilter /> Lọc nâng cao
          </button>
          <button className="px-4 py-2 bg-[#E78720] text-white rounded-lg text-sm font-medium hover:bg-[#d67610] shadow-sm">
            + Thêm mới
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E78720]/20 focus:border-[#E78720]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E78720] bg-white"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="Buyer">Người mua (Buyer)</option>
          <option value="Seller">Người bán (Seller)</option>
          <option value="Admin">Quản trị viên (Admin)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold 
                      ${user.role === 'Seller' ? 'bg-blue-50 text-blue-600' : 
                        user.role === 'Admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Chỉnh sửa">
                         <FiEdit2 size={16} />
                       </button>
                       {user.status === 'locked' ? (
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Mở khóa">
                            <FiUnlock size={16} />
                          </button>
                       ) : (
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Khóa tài khoản">
                            <FiLock size={16} />
                          </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
           <span>Hiển thị 1-5 trên tổng số 128 bản ghi</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Trước</button>
             <button className="px-3 py-1 bg-[#E78720] text-white rounded">1</button>
             <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
             <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Tiếp</button>
           </div>
        </div>
      </div>
    </div>
  );
}