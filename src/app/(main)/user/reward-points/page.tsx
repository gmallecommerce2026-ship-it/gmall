'use client';
import React, { useEffect, useState } from 'react';
import { Coins, CalendarCheck, Gift, History, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2 } from 'lucide-react';
import { pointService } from '@/services/point.service';
import Button from '@/components/ui/Button';
import LuckyWheel from '@/components/points/LuckyWheel';

export default function RewardPointsPage() {
  // Thêm state hasSpunToday vào pointInfo
  const [pointInfo, setPointInfo] = useState<any>(null); 
  const [history, setHistory] = useState<any[]>([]);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);

  // Hàm load dữ liệu dùng chung
  const refreshData = async () => {
    try {
      // Gọi cả 2 API để lấy thông tin mới nhất
      const [infoRes, historyRes, statusRes] = await Promise.all([
        pointService.getMyPoints(),
        pointService.getHistory(),
        pointService.getDailyStatus() // Gọi thêm cái này để biết status gacha
      ]);
      
      // Merge dữ liệu
      setPointInfo({ ...infoRes, ...statusRes });
      setHistory(historyRes);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCheckIn = async () => {
    setLoadingCheckIn(true);
    try {
      const res: any = await pointService.checkIn();
      alert(`🎉 Điểm danh thành công! +${res.reward || 100} xu`);
      refreshData(); // Reload lại toàn bộ state sau khi checkin
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi điểm danh');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const weekDays = [
    { day: 1, label: 'Th 2', reward: 100 },
    { day: 2, label: 'Th 3', reward: 150 },
    { day: 3, label: 'Th 4', reward: 200 },
    { day: 4, label: 'Th 5', reward: 250 },
    { day: 5, label: 'Th 6', reward: 300 },
    { day: 6, label: 'Th 7', reward: 400 },
    { day: 7, label: 'CN', reward: 1000, isBig: true },
  ];

  if (!pointInfo) return <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>;

  const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* 1. HEADER: Số dư & Streak */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-yellow-100 font-medium mb-1">Ví Xu Của Bạn</p>
            <h1 className="text-5xl font-bold flex items-center gap-3">
              {pointInfo.points?.toLocaleString() || 0} <span className="text-2xl font-normal opacity-90">xu</span>
            </h1>
          </div>
          <div className="text-right">
             <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md">
                <span className="text-yellow-100">Chuỗi điểm danh:</span>
                <span className="text-2xl font-bold">🔥 {pointInfo.streak} ngày</span>
             </div>
          </div>
        </div>
        <Coins className="absolute -bottom-8 -right-8 text-white opacity-20" size={180} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. CỘT TRÁI: Khu vực kiếm điểm (Điểm danh + Vòng quay) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* BOX 1: ĐIỂM DANH */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           <CalendarCheck className="text-blue-500"/> Điểm danh nhận quà
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Duy trì chuỗi check-in để nhận quà lớn vào Chủ Nhật!</p>
                    </div>
                    
                    <Button 
                        onClick={handleCheckIn}
                        disabled={pointInfo.isCheckedInToday || loadingCheckIn}
                        className={`px-6 rounded-full font-bold shadow-md transition-all ${
                            pointInfo.isCheckedInToday 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg active:scale-95'
                        }`}
                    >
                        {loadingCheckIn ? 'Đang xử lý...' : pointInfo.isCheckedInToday ? 'Đã điểm danh' : 'Điểm danh ngay'}
                    </Button>
                </div>

                {/* Timeline tuần */}
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                    {weekDays.map((item) => {
                        const isToday = item.day === currentDayOfWeek;
                        // Logic hiển thị trạng thái checkin visual
                        const isChecked = item.day < currentDayOfWeek || (isToday && pointInfo.isCheckedInToday);

                        return (
                            <div key={item.day} className={`
                                relative flex flex-col items-center p-3 rounded-xl border transition-all
                                ${isToday ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-200' : 'border-gray-100 bg-white'}
                            `}>
                                <span className="text-xs font-bold text-gray-500 mb-2">{item.label}</span>
                                {item.isBig ? (
                                    <Gift size={24} className={isChecked ? "text-orange-500" : "text-gray-300"} />
                                ) : (
                                    <Coins size={20} className={isChecked ? "text-yellow-500" : "text-gray-300"} />
                                )}
                                <span className="text-[10px] font-bold mt-2 text-gray-600">+{item.reward}</span>
                                
                                {isChecked && (
                                    <div className="absolute top-1 right-1">
                                        <CheckCircle2 size={12} className="text-green-500" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* BOX 2: VÒNG QUAY MAY MẮN */}
            {/* Hiển thị box này nổi bật nếu chưa quay */}
            <div className={`transition-all duration-500 ${!pointInfo.hasSpunToday ? 'ring-2 ring-purple-400 ring-offset-2 rounded-xl' : ''}`}>
                 <LuckyWheel onSpinSuccess={refreshData} />
            </div>

        </div>

        {/* 3. CỘT PHẢI: Lịch sử giao dịch */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
                 <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                    <History className="text-gray-500" size={20}/>
                    <h3 className="font-bold text-gray-800">Lịch sử biến động</h3>
                 </div>

                 <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Clock size={40} className="mb-2 opacity-20"/>
                            <p className="text-sm">Chưa có giao dịch</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {history.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${item.type === 'EARN' || item.type === 'EARN_GAME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {item.type.includes('EARN') ? <ArrowDownCircle size={16}/> : <ArrowUpCircle size={16}/>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[120px]" title={item.description}>
                                                {item.description}
                                            </p>
                                            <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${item.type.includes('EARN') ? 'text-green-600' : 'text-gray-800'}`}>
                                        {item.type.includes('EARN') ? '+' : '-'}{item.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}