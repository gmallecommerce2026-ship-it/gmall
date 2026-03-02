'use client';

import React, { useState } from 'react'; // Bỏ useState nếu không dùng isHovered
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Headset } from 'lucide-react';
import ChatWindow from './ChatWindow';
// [FIX] Import Store
import { useChatStore } from '@/store/useChatStore';

const ProChatWrapper = () => {
  // [FIX] Thay thế local state bằng state từ Store
  const { isOpen, toggleChat } = useChatStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2">
      
        {/* [FIX] Sử dụng biến isOpen từ store */}
            {isOpen && (
                
                    <div className="w-full h-full bg-white md:rounded-2xl md:shadow-2xl overflow-hidden border border-gray-100 flex flex-col relative">
                        {/* [FIX] ChatWindow tự xử lý đóng mở qua store, không cần truyền props onClose */}
                        <ChatWindow /> 
                    </div>
            )}

      {/* NÚT KÍCH HOẠT (THE TRIGGER) */}
      <motion.button
        layout
        // [FIX] Gọi toggleChat từ store thay vì setIsOpen local
        onClick={toggleChat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative z-[60] flex items-center gap-3 px-5 py-3 rounded-full shadow-xl border border-gray-100 dark:border-gray-800
          transition-all duration-300 group
          ${isOpen 
            ? 'bg-orange-400 text-gray-800 dark:bg-zinc-800 dark:text-white rotate-0' 
            : 'bg-orange-400 text-white dark:bg-white dark:text-black hover:scale-105'
          }
        `}
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X size={20} />
          ) : (
            <MessageSquare size={20} className={isHovered ? 'hidden' : 'block'} />
          )}
          
          {/* Icon thay đổi khi hover */}
          {!isOpen && isHovered && (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Headset size={20} />
             </motion.div>
          )}
          
          {/* Status Dot */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white dark:border-black"></span>
            </span>
          )}
        </div>

        {/* Text Label */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="flex flex-col items-start leading-none pr-1 pl-2">
                <span className="font-semibold text-sm">Chat & Tư Vấn 24/7</span>
                {isHovered && <span className="text-[10px] opacity-80 mt-0.5 font-light">Phản hồi ngay</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ProChatWrapper;