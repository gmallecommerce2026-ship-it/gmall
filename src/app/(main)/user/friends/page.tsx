'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserMinus, MessageCircle, UserCheck, UserX, Clock, Loader2, Search, UserPlus, Banknote
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import socket from '@/services/socket';
import { useDebounce } from '@/hooks/useDebounce'; // Đảm bảo bạn có hook này, nếu chưa có xem phần ghi chú cuối
import { useChatStore } from '@/store/useChatStore';
import TransferModal from '@/components/points/TransferModal';
import FriendHoverCard from '@/components/common/FriendHoverCard'; // Spec [0018]: hover popup

// Định nghĩa kiểu dữ liệu
interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  joinedAt: string;
  isOnline?: boolean;
}

interface FriendRequest {
  id: string;
  senderId: string;
  status: 'PENDING';
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface SearchResultUser {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  role: string;
  status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIEND';
}

type FriendTab = 'my-friends' | 'requests' | 'search';

export default function FriendsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FriendTab>('my-friends');
  
  // State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [transferModalData, setTransferModalData] = useState<{ isOpen: boolean; friendId: string; friendName: string }>({
    isOpen: false,
    friendId: '',
    friendName: '',
  });

  const openTransferModal = (friend: any) => {
    setTransferModalData({
      isOpen: true,
      friendId: friend.id,
      friendName: friend.name || friend.email, // Hiển thị tên
    });
  };

  const openChatWithFriend = useChatStore((state) => state.openChatWithFriend);
  
  const handleChat = (friend: Friend) => {
    openChatWithFriend(
      friend.id, 
      friend.name, 
      friend.avatar || undefined
    );
  };
  const handleTransfer = (friend: Friend) => {
    // Logic chuyển tiền: Ví dụ chuyển hướng sang trang nạp tiền/chuyển tiền kèm ID người nhận
    // router.push(`/user/wallet/transfer?to=${friend.id}`);
    alert(`Tính năng chuyển tiền cho ${friend.name} đang phát triển!`);
  };
  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep — moved up
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-friends') {
        const res = await api.get('/friends/my-friends');
        // SỬA: Bỏ .data đi, dùng res trực tiếp (vì api.ts đã xử lý rồi)
        setFriends(res as any);
      } else if (activeTab === 'requests') {
        const res = await api.get('/friends/pending');
        // SỬA: Bỏ .data đi
        setRequests(res as any);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleSearchUsers = async (query: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/friends/search?q=${query}`);
      // SỬA: Bỏ .data đi
      setSearchResults(res as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch data khi chuyển tab
  useEffect(() => {
    if (activeTab === 'my-friends' || activeTab === 'requests') {
      fetchData();
    }
  }, [activeTab, fetchData]);

  // 2. Fetch search khi query thay đổi (ở tab search)
  useEffect(() => {
    if (activeTab === 'search' && debouncedSearch) {
      handleSearchUsers(debouncedSearch);
    } else if (activeTab === 'search' && !debouncedSearch) {
      setSearchResults([]);
    }
  }, [debouncedSearch, activeTab]);

  // 3. Socket Real-time (Giữ nguyên logic cũ)
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('new_friend_request', (newRequest: FriendRequest) => {
      setRequests((prev) => [newRequest, ...prev]);
    });

    socket.on('friend_request_accepted', (data: any) => {
       // Refresh lại list nếu cần thiết, hoặc bắn toast
       if (activeTab === 'my-friends') fetchData();

       // Cập nhật lại trạng thái trong list tìm kiếm nếu đang search đúng người đó
       setSearchResults(prev => prev.map(u =>
         u.id === data.receiver.id ? { ...u, status: 'FRIEND' } : u
       ));
    });

    return () => {
      socket.off('new_friend_request');
      socket.off('friend_request_accepted');
    };
  }, [activeTab, fetchData]);

  // --- ACTIONS ---

  // Gửi lời mời kết bạn
  const handleSendRequest = async (receiverId: string) => {
    try {
      await api.post('/friends/request', { receiverId });
      // Update UI ngay lập tức
      setSearchResults(prev => prev.map(u => 
        u.id === receiverId ? { ...u, status: 'PENDING_SENT' } : u
      ));
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi gửi lời mời");
    }
  };

  // Chấp nhận/Từ chối
  const handleResponse = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await api.post('/friends/response', { requestId, action });
      const reqItem = requests.find(r => r.id === requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));

      if (action === 'ACCEPT' && reqItem) {
        // Nếu user chấp nhận ngay tại tab search (nếu sau này làm), logic tương tự
      }
    } catch (error) {
      alert("Lỗi xử lý");
    }
  };

  const handleUnfriend = async (friendId: string) => {
    if (!confirm("Hủy kết bạn?")) return;
    try {
      await api.delete(`/friends/${friendId}`);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      alert("Lỗi hủy kết bạn");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
       <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Bạn bè & Tương tác</h1>

       {/* Tabs Navigation */}
       <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => setActiveTab('my-friends')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'my-friends' ? 'bg-brand-orange text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Bạn bè ({friends?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-brand-orange text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Lời mời 
            {(requests?.length || 0) > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
          </button>
          <button 
            onClick={() => { setActiveTab('search'); setSearchQuery(''); setSearchResults([]); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'search' ? 'bg-brand-orange text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Search size={14} /> Tìm bạn mới
          </button>
       </div>

       {/* --- SEARCH TAB CONTENT --- */}
       {activeTab === 'search' && (
         <div className="mb-6 animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
               <input 
                 type="text" 
                 placeholder="Nhập tên hoặc email để tìm kiếm..." 
                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
               />
               <Search className="absolute left-3.5 top-3.5 text-gray-400" size={20} />
            </div>

            {loading && <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-orange"/></div>}

            {!loading && searchQuery && (searchResults?.length || 0) === 0 && (
              <p className="text-center text-gray-500 mt-4">Không tìm thấy người dùng nào phù hợp.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {searchResults?.map(user => (
                 <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                       <img 
                         src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                         alt={user.name} 
                         className="w-12 h-12 rounded-full object-cover border border-gray-100"
                       />
                       <div>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                           {user.name}
                           {/* Hiển thị badge nếu là Seller */}
                           {user.role === 'SELLER' && (
                                 <span className="bg-orange-100 text-brand-orange text-[10px] px-1.5 py-0.5 rounded border border-orange-200">
                                    Người bán
                                 </span>
                           )}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                     </div>
                    </div>
                    
                    {/* Nút hành động dựa trên status */}
                    <div>
                      {user.status === 'NONE' && (
                        <Button 
                          onClick={() => handleSendRequest(user.id)}
                          className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                        >
                          <UserPlus size={14} /> Kết bạn
                        </Button>
                      )}
                      {user.status === 'PENDING_SENT' && (
                        <button disabled className="inline-flex items-center justify-center h-8 px-3 text-xs bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-medium">
                          Đã gửi
                        </button>
                      )}
                      {user.status === 'PENDING_RECEIVED' && (
                        <button 
                           onClick={() => setActiveTab('requests')} // Chuyển sang tab requests để xử lý
                           className="h-8 px-3 text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-100 font-medium"
                        >
                          Trả lời
                        </button>
                      )}
                      {user.status === 'FRIEND' && (
                        <button disabled className="h-8 px-3 text-xs bg-green-50 text-green-600 border border-green-200 rounded-lg font-medium flex items-center gap-1">
                          <UserCheck size={14}/> Bạn bè
                        </button>
                      )}
                    </div>
                 </div>
               ))}
            </div>
         </div>
       )}

       {/* --- MY FRIENDS TAB --- */}
       {activeTab === 'my-friends' && (
           <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
              {loading && <div className="text-center py-4 text-gray-500">Đang tải...</div>}
              {!loading && (friends?.length || 0) === 0 && <p className="text-center text-gray-500 py-8">Chưa có bạn bè.</p>}
              
              {friends?.map((f) => (
                  <div key={f.friendshipId} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-white">
                     {/* Spec [0018]: hover avatar/name -> popup info công khai (ẩn SĐT) */}
                     <FriendHoverCard
                        friend={f}
                        onChat={() => handleChat(f)}
                        onTransfer={() => openTransferModal(f)}
                     >
                        <div className="flex items-center gap-4 cursor-pointer">
                           <img
                             src={f.avatar || `https://ui-avatars.com/api/?name=${f.name}&background=random`}
                             alt={f.name}
                             className="w-12 h-12 rounded-full border border-gray-100 object-cover"
                           />
                           <div>
                               <p className="text-sm font-bold text-gray-800">{f.name}</p>
                               <p className="text-xs text-gray-500 flex items-center gap-1">
                                  {f.isOnline ? <span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span> Online</span> : "Offline"}
                               </p>
                           </div>
                        </div>
                     </FriendHoverCard>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleChat(f)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <MessageCircle size={16} /> Nhắn tin
                        </button>
                        <button 
                           onClick={() => openTransferModal(f)}
                           className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                           title="Chuyển xu"
                        >
                           <Banknote size={16} /> Chuyển xu
                        </button>
                        <button 
                          onClick={() => handleUnfriend(f.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Hủy kết bạn"
                        >
                            <UserMinus size={18} />
                        </button>
                     </div>
                  </div>
              ))}
              <TransferModal 
                     isOpen={transferModalData.isOpen}
                     onClose={() => setTransferModalData({ ...transferModalData, isOpen: false })}
                     friendId={transferModalData.friendId}
                     friendName={transferModalData.friendName}
                     onSuccess={() => {
                        // Refresh lại thông tin số dư của mình nếu cần
                        console.log("Chuyển thành công, refresh user data");
                     }}
               />
           </div>
       )}

       {/* --- REQUESTS TAB --- */}
       {activeTab === 'requests' && (
           <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
              {loading && <div className="text-center py-4 text-gray-500">Đang tải...</div>}
              {!loading && (requests?.length || 0) === 0 && <p className="text-center text-gray-500 py-8">Không có lời mời nào.</p>}

              {requests?.map((r) => (
                  <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm gap-4">
                     <div className="flex items-center gap-4">
                        <img 
                          src={r.sender.avatar || `https://ui-avatars.com/api/?name=${r.sender.name}&background=random`} 
                          alt="req" 
                          className="w-14 h-14 rounded-full border border-gray-100 object-cover" 
                        />
                        <div>
                            <p className="text-sm font-bold text-gray-800">{r.sender.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Clock size={12}/> {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Button onClick={() => handleResponse(r.id, 'ACCEPT')} className="h-9 text-sm px-4 bg-brand-orange hover:bg-orange-600 flex items-center gap-2">
                            <UserCheck size={16} /> Chấp nhận
                        </Button>
                        <button onClick={() => handleResponse(r.id, 'REJECT')} className="h-9 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors">
                            <UserX size={16} /> Xóa
                        </button>
                     </div>
                  </div>
              ))}
           </div>
       )}
    </div>
  );
}