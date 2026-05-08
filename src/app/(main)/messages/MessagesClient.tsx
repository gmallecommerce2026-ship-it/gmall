"use client";
import React, { useState, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { apiClient } from '@/lib/api/ApiClient'; // Import apiClient của bạn
import { useUserStore } from '@/store/useUserStore';
import { useSearchParams } from 'next/navigation';

export default function MessagesClient() {
  const searchParams = useSearchParams();
  const receiverId = searchParams.get('receiverId');
  const { conversations, activeConversationId, messages, sendMessage, selectConversation, loadConversations, openChatWithSeller } = useChatStore();
  // --- STATE CHO TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // hooks-fix wiki 0031: thêm loadConversations vào deps. Hàm từ Zustand store
  // ổn định identity nên không gây re-run, an toàn để add.
  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Hàm xử lý tìm kiếm (nên dùng debounce nếu có thể)
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (val.length > 2) { // Chỉ tìm khi gõ > 2 ký tự
      setIsSearching(true);
      try {
        const res = await apiClient.get(`/chat/users/search?q=${val}`);
        setSearchResults(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Khi click vào user tìm thấy -> Tạo hội thoại
  const handleSelectUser = async (partnerId: string) => {
    // Tái sử dụng hàm openChatWithSeller (thực chất là openChatWithUser)
    await openChatWithSeller(partnerId); 
    setSearchTerm('');
    setSearchResults([]);
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col relative">
        <div className="p-4 border-b z-10">
          <h2 className="text-xl font-bold mb-4">Chat</h2>
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 ring-blue-500"
          />
        </div>

        {/* LIST KẾT QUẢ TÌM KIẾM (Overlay lên list chat cũ) */}
        {searchTerm.length > 0 ? (
           <div className="flex-1 overflow-y-auto bg-white absolute top-[130px] w-full h-full z-20">
              <p className="px-4 py-2 text-xs text-gray-400 font-bold">KẾT QUẢ TÌM KIẾM</p>
              {searchResults.map(user => (
                <div 
                   key={user.id} 
                   onClick={() => handleSelectUser(user.id)}
                   className="p-3 flex gap-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                >
                   <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                   </div>
                </div>
              ))}
              {searchResults.length === 0 && !isSearching && (
                 <div className="p-4 text-center text-gray-500">Không tìm thấy user nào</div>
              )}
           </div>
        ) : (
          /* LIST HỘI THOẠI CŨ (Giữ nguyên code cũ của bạn) */
          <div className="flex-1 overflow-y-auto">
             {conversations.map(conv => (
                <div 
                   key={conv.id} 
                   onClick={() => selectConversation(conv.id)}
                   className={`p-3 flex gap-3 cursor-pointer hover:bg-gray-50 ${activeConversationId === conv.id ? 'bg-blue-50' : ''}`}
                >
                   {/* Render Avatar & Info */}
                   <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img src={conv.partner.avatar || '/assets/user-placeholder.png'} className="w-full h-full object-cover"/>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                         <p className="font-semibold truncate">{conv.partner.name}</p>
                         {conv.unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1 rounded-full h-fit">{conv.unreadCount}</span>}
                      </div>
                      <p className={`text-sm truncate w-40 ${conv.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                         {conv.lastMessage}
                      </p>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>

      {/* --- CENTER & RIGHT (Giữ nguyên như code cũ) --- */}
      {/* ... */}
    </div>
  );
}