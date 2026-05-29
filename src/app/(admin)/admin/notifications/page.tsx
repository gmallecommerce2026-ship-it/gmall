'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { notificationService, NotificationItem } from '@/services/notification.service';

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

export default function AdminNotificationsPage() {
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
    } catch {/* ignore */} finally {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">Thông báo hệ thống</h1>
        <button
          onClick={markAllAsRead}
          disabled={markingAll || notifications.every(n => n.isRead)}
          className="text-gray-500 text-sm hover:text-brand-orange transition-colors flex items-center gap-1 disabled:opacity-40"
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
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!item.isRead ? 'bg-orange-50/40' : ''}`}
            >
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
              </div>
              {!item.isRead && <div className="w-2.5 h-2.5 bg-brand-orange rounded-full mt-2" />}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">Chưa có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
