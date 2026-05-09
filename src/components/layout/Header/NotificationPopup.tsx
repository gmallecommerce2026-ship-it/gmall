// src/components/layout/Header/NotificationPopup.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { notificationService, NotificationItem } from "@/services/notification.service";

// #11/#23/#35/#53 (wiki 0044/0045): wire BE.
// Trước: hardcode 3 mock notification (DH123456, Flash Sale, NEWMEMBER).
// Sau: fetch /notifications page=1, pageSize=5 (chỉ hiển 5 mới nhất trong popup).

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return iso;
  }
};

const NotificationPopup = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.list(1, 5)
      .then((res) => setItems(res.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-[400px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Thông báo mới nhận</h3>
        <Link href="/user/notifications" className="text-xs text-brand-orange hover:underline">Xem tất cả</Link>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
            <Bell className="text-gray-300" size={32} />
            Chưa có thông báo nào
          </div>
        ) : (
          items.map((notif) => {
            const inner = (
              <>
                <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
                  {notif.image ? (
                    <img src={notif.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <Bell className="text-gray-400" size={20} />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{notif.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.content}</p>
                  <span className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</span>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 flex-shrink-0"></div>}
              </>
            );
            const className = `flex gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!notif.isRead ? 'bg-orange-50/30' : ''}`;
            return notif.link ? (
              <Link key={notif.id} href={notif.link} className={className}>
                {inner}
              </Link>
            ) : (
              <div key={notif.id} className={className}>
                {inner}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
