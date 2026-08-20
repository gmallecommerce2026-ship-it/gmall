// src/layout/seller/SellerRightSidebar.tsx
'use client';

import React, { useMemo } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { MessageCircle, HelpCircle } from 'lucide-react';

const SellerRightSidebar = () => {
  // Lấy isOpen để toggle highlight nút
  const { toggleChat, conversations, isOpen } = useChatStore();

  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  // wiki 0110: z-index hạ 40 → 35. Nền mờ của drawer menu (mobile) là z-40 và nằm SAU trong
  // DOM, nên khi z bằng nhau thì nút chat nổi này vẫn đè lên nền mờ và bấm được trong lúc
  // menu đang mở. Nó chỉ cần nổi trên nội dung trang, không cần nổi trên lớp phủ điều hướng.
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[35] flex flex-col gap-3">
       <div className="bg-white rounded-l-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-r-0 border-gray-100 p-2 flex flex-col gap-2">
        <button
          onClick={toggleChat} // Click vào đây sẽ set isOpen = !isOpen -> Mở/Đóng ChatWindow
          className={`
            relative group p-3 rounded-lg transition-all duration-200 flex items-center justify-center
            ${isOpen ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-50 text-gray-600 hover:text-orange-600'}
          `}
        >
          <MessageCircle size={22} className={isOpen ? 'fill-current' : ''} />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SellerRightSidebar;