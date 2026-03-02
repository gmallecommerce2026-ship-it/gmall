'use client';
import React, { useState } from 'react';
import { UserMinus, MessageCircle, UserCheck, UserX, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

type FriendTab = 'my-friends' | 'requests';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<FriendTab>('my-friends');

  return (
    <div className="p-6">
       <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Bạn bè & Tương tác</h1>

       {/* Tabs */}
       <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('my-friends')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'my-friends' ? 'bg-brand-orange text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Danh sách bạn bè
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-brand-orange text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Lời mời kết bạn <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
          </button>
       </div>

       {/* Tab Content: My Friends */}
       {activeTab === 'my-friends' && (
           <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((f) => (
                  <div key={f} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-white">
                     <div className="flex items-center gap-4">
                        <img src={`https://i.pravatar.cc/150?u=friend${f}`} alt="friend" className="w-12 h-12 rounded-full border border-gray-100" />
                        <div>
                            <p className="text-sm font-bold text-gray-800">Trần Thị B</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Online</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <MessageCircle size={16} /> Nhắn tin
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hủy kết bạn">
                            <UserMinus size={18} />
                        </button>
                     </div>
                  </div>
              ))}
           </div>
       )}

       {/* Tab Content: Requests */}
       {activeTab === 'requests' && (
           <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((r) => (
                  <div key={r} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm gap-4">
                     <div className="flex items-center gap-4">
                        <img src={`https://i.pravatar.cc/150?u=req${r}`} alt="request" className="w-14 h-14 rounded-full border border-gray-100" />
                        <div>
                            <p className="text-sm font-bold text-gray-800">Lê Văn C</p>
                            <p className="text-xs text-gray-500 mb-1">2 bạn chung</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> Gửi 2 giờ trước</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Button className="h-9 text-sm px-4 bg-brand-orange hover:bg-orange-600 flex items-center gap-2">
                            <UserCheck size={16} /> Chấp nhận
                        </Button>
                        <button className="h-9 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors">
                            <UserX size={16} /> Xóa
                        </button>
                     </div>
                  </div>
              ))}
              <div className="text-center mt-4">
                 <p className="text-sm text-gray-500">Đã hết lời mời kết bạn.</p>
              </div>
           </div>
       )}
    </div>
  );
}