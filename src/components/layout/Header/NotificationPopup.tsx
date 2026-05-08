// src/components/layout/Header/NotificationPopup.tsx
"use client";

import React from "react";
import Link from "next/link";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Đơn hàng #DH123456 đã được giao thành công",
    desc: "Cảm ơn bạn đã mua sắm tại GMall. Hãy đánh giá sản phẩm để nhận 200 xu nhé!",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=100&q=80",
    isRead: false,
    time: "12:30 25/12/2025"
  },
  {
    id: 2,
    title: "🔥 Flash Sale 50% sắp diễn ra!",
    desc: "Chỉ còn 30 phút nữa. Săn ngay son MAC giá chỉ 199k.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&q=80",
    isRead: true,
    time: "09:00 25/12/2025"
  },
  {
    id: 3,
    title: "Chào mừng bạn mới!",
    desc: "Nhập mã NEWMEMBER để giảm 50k cho đơn đầu tiên.",
    image: "/assets/ImageAsset124.png",
    isRead: true,
    time: "Hôm qua"
  }
];

const NotificationPopup = () => {
  return (
    <div className="w-[400px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Thông báo mới nhận</h3>
        <Link href="/notifications" className="text-xs text-brand-orange hover:underline">Xem tất cả</Link>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {NOTIFICATIONS.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Chưa có thông báo nào</div>
        ) : (
          NOTIFICATIONS.map((notif) => (
            <div 
              key={notif.id} 
              className={`flex gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
            >
              <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                <img src={notif.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{notif.title}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.desc}</p>
                <span className="text-[10px] text-gray-400 mt-1">{notif.time}</span>
              </div>
              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 flex-shrink-0"></div>}
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
        <button className="text-xs font-medium text-gray-600 hover:text-brand-orange transition-colors w-full py-1">
          Đánh dấu đã đọc tất cả
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;