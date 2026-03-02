'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Bell, ShoppingBag, Tag, Info, CheckCheck } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho thông báo
type NotificationType = 'order' | 'promotion' | 'system';

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  link: string;
  image?: string;
}

// Mock data
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: 'order',
    title: 'Giao hàng thành công',
    content: 'Đơn hàng #ORD-123456 của bạn đã được giao thành công. Hãy đánh giá sản phẩm để nhận xu nhé!',
    time: '14:30 20/10/2023',
    isRead: false,
    link: '/user/purchase?type=completed',
    image: 'https://placehold.co/100' // Ảnh sản phẩm
  },
  {
    id: 2,
    type: 'promotion',
    title: 'Sale giữa tháng - Giảm đến 50%',
    content: 'Duy nhất hôm nay! Voucher giảm 50% tối đa 100k đã được thêm vào ví của bạn. Mua ngay!',
    time: '09:00 20/10/2023',
    isRead: false,
    link: '/product',
    image: 'https://placehold.co/100'
  },
  {
    id: 3,
    type: 'system',
    title: 'Cập nhật chính sách bảo mật',
    content: 'Chúng tôi vừa cập nhật chính sách bảo mật mới. Vui lòng xem chi tiết để đảm bảo quyền lợi.',
    time: 'Yesterday',
    isRead: true,
    link: '/privacy'
  },
  {
    id: 4,
    type: 'order',
    title: 'Đơn hàng đang vận chuyển',
    content: 'Đơn hàng #ORD-789012 đã được giao cho đơn vị vận chuyển. Vui lòng chú ý điện thoại nhận hàng.',
    time: 'Yesterday',
    isRead: true,
    link: '/user/purchase?type=shipping',
    image: 'https://placehold.co/100'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Hàm lấy icon dựa trên loại thông báo
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} className="text-brand-orange" />;
      case 'promotion':
        return <Tag size={18} className="text-brand-orange" />;
      case 'system':
      default:
        return <Info size={18} className="text-brand-orange" />;
    }
  };

  // Hàm xử lý "Đánh dấu đã đọc tất cả"
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
  };

  return (
    <div className="bg-white min-h-[500px]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
         <h1 className="text-lg font-bold text-gray-800">Thông báo</h1>
         <button 
            onClick={markAllAsRead}
            className="text-gray-500 text-sm hover:text-brand-orange transition-colors flex items-center gap-1"
         >
            <CheckCheck size={16} /> Đánh dấu đã đọc tất cả
         </button>
      </div>

      {/* Notification List */}
      <div>
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div 
                key={item.id} 
                className={`flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative ${!item.isRead ? 'bg-orange-50/40' : 'bg-white'}`}
            >
                {/* Image / Icon Box */}
                <div className="flex-shrink-0">
                    {item.image ? (
                         <div className="w-16 h-16 border border-gray-200 rounded bg-white overflow-hidden relative">
                             <img src={item.image} alt="notification" className="w-full h-full object-cover" />
                             {/* Loại thông báo badge */}
                             <div className="absolute bottom-0 right-0 bg-gray-100/90 p-0.5 rounded-tl">
                                {getIcon(item.type)}
                             </div>
                         </div>
                    ) : (
                        <div className="w-16 h-16 border border-gray-200 rounded-full bg-orange-50 flex items-center justify-center">
                            {getIcon(item.type)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 pr-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-1">{item.content}</p>
                    <span className="text-xs text-gray-400">{item.time}</span>
                </div>

                {/* View Details Button (Optional hover effect) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity hidden md:block">
                    <Link href={item.link}>
                         <Button variant="outline" className="!px-4 !py-1.5 !text-xs !h-auto">Xem chi tiết</Button>
                    </Link>
                </div>

                {/* Unread Indicator Dot */}
                {!item.isRead && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-orange rounded-full"></div>
                )}
            </div>
          ))
        ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500">Bạn chưa có thông báo nào</p>
            </div>
        )}
      </div>
    </div>
  );
}