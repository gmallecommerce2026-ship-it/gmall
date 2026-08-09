'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User, FileText, Bell,
  Gift, Users, HelpCircle
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

// #49 (wiki 0044/0045): UserSidebar trước đây hardcode user demo "Nguyễn Văn A".
// Thay bằng useUserStore — hiển tên + avatar thật của user đăng nhập.
// Fallback gọn nếu chưa có user (loading) hoặc avatar (default placeholder).
const UserSidebar = () => {
  const pathname = usePathname();
  const storeUser = useUserStore(s => s.user);
  const user = {
    name: storeUser?.name || 'Khách',
    avatar: storeUser?.avatar || '/assets/default-avatar.svg',
  };

  const menuItems = [
    {
      title: 'Tài khoản của tôi',
      icon: <User size={20} />,
      path: '/user',
      subItems: [
        { label: 'Hồ sơ', path: '/user/profile' },
        { label: 'Địa chỉ', path: '/user/address' },
        { label: 'Đổi mật khẩu', path: '/user/password' },
      ],
    },
    {
      title: 'Trạng thái đơn hàng',
      icon: <FileText size={20} />,
      path: '/user/purchase',
    },
    {
      title: 'Ví & Ưu đãi',
      icon: <Gift size={20} />, // Nhóm tính năng thưởng
      path: '/user/rewards', // Dummy path for grouping
      subItems: [
        { label: 'Kho Voucher', path: '/user/vouchers' }, // MỚI
        { label: 'Lịch sử điểm thưởng', path: '/user/reward-points' }, // MỚI
      ]
    },
    {
      title: 'Cộng đồng & Tương tác',
      icon: <Users size={20} />, 
      path: '/user/social', // Dummy path
      subItems: [
        { label: 'Đánh giá sản phẩm', path: '/user/reviews' }, // MỚI
        { label: 'Quản lý bạn bè', path: '/user/friends' }, // MỚI
        { label: 'Mời bạn bè', path: '/user/invite' }, // MỚI
        { label: 'Link giới thiệu', path: '/user/affiliate' }, // wiki 0095 B6
      ]
    },
    {
      title: 'Thông báo',
      icon: <Bell size={20} />,
      path: '/user/notifications',
    },
    {
      title: 'Trung tâm trợ giúp',
      icon: <HelpCircle size={20} />, // MỚI
      path: '/user/help',
    },
  ];

  return (
    <div className="w-full">
      {/* User Brief */}
      <div className="flex items-center gap-3 py-4 border-b border-gray-100 mb-4">
        <img 
            src={user.avatar} 
            alt="avatar" 
            className="w-12 h-12 rounded-full border border-gray-200 object-cover" 
        />
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 text-sm">{user.name}</span>
          <Link href="/user/profile" className="text-gray-500 text-xs flex items-center gap-1 hover:text-brand-orange">
            <User size={12} /> Sửa hồ sơ
          </Link>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item, index) => {
            // Logic active mở rộng để bắt các path con
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isParentActive = hasSubItems 
                ? item.subItems.some(sub => pathname.startsWith(sub.path))
                : pathname.startsWith(item.path);

            return (
                <div key={index} className="group">
                    {hasSubItems ? (
                        <div className="mb-2">
                             <div className={`flex items-center gap-3 px-3 py-2 font-medium ${isParentActive ? 'text-brand-orange' : 'text-gray-800'}`}>
                                <span className={isParentActive ? 'text-brand-orange' : 'text-black'}>{item.icon}</span>
                                {item.title}
                             </div>
                             <div className="flex flex-col gap-1 pl-10">
                                {item.subItems.map((sub, subIdx) => {
                                    const isSubActive = pathname === sub.path;
                                    return (
                                        <Link 
                                            key={subIdx} 
                                            href={sub.path}
                                            className={`text-sm py-1 hover:text-brand-orange transition-colors ${isSubActive ? 'text-brand-orange font-medium' : 'text-gray-500'}`}
                                        >
                                            {sub.label}
                                        </Link>
                                    )
                                })}
                             </div>
                        </div>
                    ) : (
                        <Link 
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isParentActive ? 'text-brand-orange bg-orange-50' : 'text-gray-800 hover:bg-gray-50 hover:text-brand-orange'}`}
                        >
                            <span className={isParentActive ? 'text-brand-orange' : 'text-black'}>{item.icon}</span>
                            {item.title}
                        </Link>
                    )}
                </div>
            )
        })}
      </nav>
    </div>
  );
};

export default UserSidebar;