'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Bell, ShoppingBag, Tag, Info, MessageCircle, Users, CheckCheck, Loader2 } from 'lucide-react';
import { notificationService, NotificationItem } from '@/services/notification.service';

// #11/#23/#35/#53 (wiki 0044/0045): wire BE.
// Trước: hardcode MOCK_NOTIFICATIONS 4 mục.
// Sau: fetch /notifications, mark-read khi click, mark-all-read button.

const ICON_BY_TYPE: Record<string, React.ReactNode> = {
  ORDER: <ShoppingBag size={18} className="text-brand-orange" />,
  PROMOTION: <Tag size={18} className="text-brand-orange" />,
  CHAT: <MessageCircle size={18} className="text-brand-orange" />,
  FRIEND: <Users size={18} className="text-brand-orange" />,
  SYSTEM: <Info size={18} className="text-brand-orange" />,
};

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    notificationService.list(1, 50)
      .then((res) => setNotifications(res.items || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try { await notificationService.markRead(item.id); } catch {}
      setNotifications((prev) => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    }
  };

  return (
    <div className="bg-white min-h-[500px]">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
         <h1 className="text-lg font-bold text-gray-800">Thông báo</h1>
         <button
            onClick={markAllAsRead}
            disabled={markingAll || notifications.every(n => n.isRead)}
            className="text-gray-500 text-sm hover:text-brand-orange transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
         >
            <CheckCheck size={16} /> Đánh dấu đã đọc tất cả
         </button>
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={20} /> Đang tải...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((item) => {
            const inner = (
              <>
                <div className="flex-shrink-0">
                    {item.image ? (
                         <div className="w-16 h-16 border border-gray-200 rounded bg-white overflow-hidden relative">
                             <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }} />
                             <div className="absolute bottom-0 right-0 bg-gray-100/90 p-0.5 rounded-tl">
                                {ICON_BY_TYPE[item.type] || ICON_BY_TYPE.SYSTEM}
                             </div>
                         </div>
                    ) : (
                        <div className="w-16 h-16 border border-gray-200 rounded-full bg-orange-50 flex items-center justify-center">
                            {ICON_BY_TYPE[item.type] || ICON_BY_TYPE.SYSTEM}
                        </div>
                    )}
                </div>
                <div className="flex-1 pr-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-1">{item.content}</p>
                    <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
                </div>
                {item.link && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                      <Button variant="outline" className="!px-4 !py-1.5 !text-xs !h-auto">Xem chi tiết</Button>
                  </div>
                )}
                {!item.isRead && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-orange rounded-full"></div>
                )}
              </>
            );

            const className = `group flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative ${!item.isRead ? 'bg-orange-50/40' : 'bg-white'}`;

            return item.link ? (
              <Link key={item.id} href={item.link} className={className} onClick={() => handleClick(item)}>
                {inner}
              </Link>
            ) : (
              <div key={item.id} className={className} onClick={() => handleClick(item)}>
                {inner}
              </div>
            );
          })
        ) : (
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
