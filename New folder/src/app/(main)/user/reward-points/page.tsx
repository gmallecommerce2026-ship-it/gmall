'use client';
import React, { useEffect, useState } from 'react';
import { Coins, CalendarCheck, Gift, ArrowRightLeft, History, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2 } from 'lucide-react';
import { pointService } from '@/services/point.service';
import Button from '@/components/ui/Button';
import { PointHistory, CheckInState } from '@/types/point';
import LuckyWheel from '@/components/points/LuckyWheel'; // Import component vừa tạo

export default function RewardPointsPage() {
  const [pointInfo, setPointInfo] = useState<CheckInState | null>(null);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);

  useEffect(() => {
    fetchData();
    fetchHistory();
  }, []);

  const fetchData = async () => {
    try {
      const res = await pointService.getMyPoints();
      setPointInfo(res);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await pointService.getHistory();
      setHistory(res);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    }
  };

  const handleCheckIn = async () => {
    setLoadingCheckIn(true);
    try {
      const res: any = await pointService.checkIn();
      alert(`🎉 Điểm danh thành công! +${res.reward || 100} xu`);
      fetchData(); 
      fetchHistory();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Bạn đã điểm danh hôm nay rồi!');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  // Logic hiển thị tuần: T2 (1) -> CN (7)
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

  // Tính toán tiến độ điểm danh (Dựa vào streak hoặc logic reset T2 của backend)
  // Giả sử API trả về `dayOfWeek` (1=T2, 7=CN) hiện tại để highlight
  // Nếu không có `dayOfWeek` từ API, dùng new Date().getDay() (lưu ý JS Sunday=0)
  const currentDayOfWeek = pointInfo.dayOfWeek || (new Date().getDay() === 0 ? 7 : new Date().getDay()); 
  
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* 1. Tổng quan điểm */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-yellow-100 font-medium mb-1">Số dư khả dụng</p>
            <h1 className="text-5xl font-bold flex items-center gap-3">
              {pointInfo.points?.toLocaleString() || 0} <span className="text-2xl opacity-80">Xu</span>
            </h1>
          </div>
          <div className="text-right bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <p className="text-sm text-yellow-50 mb-1">Chuỗi liên tục</p>
            <p className="text-3xl font-bold flex items-center justify-end gap-2">
               🔥 {pointInfo.streak} <span className="text-sm font-normal">ngày</span>
            </p>
          </div>
        </div>
        <Coins className="absolute -bottom-10 -right-10 text-white opacity-20" size={200} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Cột Trái: Điểm danh & Gacha */}
        <div className="lg:col-span-2 space-y-6">
            {/* Section Điểm danh */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <CalendarCheck size={24} />
                        </div>
                        <div>
                        <h2 className="text-lg font-bold text-gray-800">Điểm danh mỗi ngày</h2>
                        <p className="text-sm text-gray-500">Reset chuỗi vào Thứ 2 hàng tuần</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleCheckIn}
                        disabled={pointInfo.isCheckedInToday || loadingCheckIn}
                        className={`px-6 h-10 rounded-full font-bold text-sm transition-all shadow-md ${
                        pointInfo.isCheckedInToday 
                            ? 'bg-green-100 text-green-700 border-green-200 shadow-none' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105'
                        }`}
                    >
                        {loadingCheckIn ? '...' : pointInfo.isCheckedInToday ? 'Đã điểm danh' : 'Điểm danh ngay'}
                    </Button>
                </div>

                {/* Timeline 7 Ngày (T2 -> CN) */}
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {weekDays.map((item) => {
                    // Logic xác định trạng thái của từng ngày
                    const isToday = item.day === currentDayOfWeek;
                    const isPast = item.day < currentDayOfWeek;
                    // Logic giả định: Nếu là quá khứ mà streak đủ dài thì coi như đã checkin (hoặc dựa vào data backend trả về list ngày đã checkin)
                    // Ở đây làm đơn giản: Check theo streak hiện tại và ngày trong tuần
                    
                    // Để chính xác nhất, Backend nên trả về mảng `checkedInDays: [1, 2, 3]`
                    // Tạm thời hiển thị: Ngày quá khứ mờ đi, ngày hôm nay nổi bật
                    
                    return (
                        <div 
                            key={item.day} 
                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                isToday 
                                    ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 scale-105 z-10' 
                                    : isPast
                                        ? 'bg-gray-50 border-gray-200 opacity-70'
                                        : 'bg-white border-gray-100'
                            }`}
                        >
                            <span className={`text-xs font-bold mb-2 ${isToday ? 'text-orange-600' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                            
                            <div className="relative">
                                {item.isBig ? (
                                    <Gift size={24} className={isToday ? 'text-orange-500' : 'text-purple-400'} />
                                ) : (
                                    <Coins size={20} className={isToday ? 'text-yellow-500' : 'text-gray-300'} />
                                )}
                                
                                {/* Dấu tích nếu đã qua hoặc hôm nay đã checkin */}
                                {(isPast || (isToday && pointInfo.isCheckedInToday)) && (
                                    <div className="absolute -bottom-1 -right-2 bg-white rounded-full">
                                        <CheckCircle2 size={14} className="text-green-500 fill-white" />
                                    </div>
                                )}
                            </div>

                            <span className="text-[10px] mt-2 font-medium text-gray-500">+{item.reward}</span>
                        </div>
                    )
                })}
                </div>
            </div>

            {/* Section Gacha (Mới) */}
            <LuckyWheel onSpinSuccess={() => { fetchData(); fetchHistory(); }} />
            
            {/* Các banner nhiệm vụ khác */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-purple-50 to-white hover:shadow-md transition cursor-pointer flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">Nhiệm vụ kiếm xu</h3>
                        <p className="text-xs text-gray-500 mt-1">Làm nhiệm vụ để nhận thêm</p>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Gift size={20}/></div>
                </div>
                 <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-green-50 to-white hover:shadow-md transition cursor-pointer flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">Chuyển xu</h3>
                        <p className="text-xs text-gray-500 mt-1">Tặng xu cho bạn bè</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><ArrowRightLeft size={20}/></div>
                </div>
            </div>
        </div>

        {/* 3. Cột Phải: Lịch sử */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col h-full min-h-[500px]">
             <div className="flex items-center justify-between mb-4 border-b pb-4 border-gray-100">
                <div className="flex items-center gap-2">
                    <History className="text-gray-400" size={20}/>
                    <h3 className="text-lg font-bold text-gray-800">Lịch sử xu</h3>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                        <Clock size={48} className="mb-3 opacity-20"/>
                        <p>Chưa có giao dịch nào</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                                item.type === 'EARN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                                {item.type === 'EARN' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className={`font-bold text-sm whitespace-nowrap ${item.type === 'EARN' ? 'text-green-600' : 'text-gray-800'}`}>
                                {item.type === 'EARN' ? '+' : '-'}{item.amount.toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
             </div>
        </div>

      </div>
    </div>
  );
}