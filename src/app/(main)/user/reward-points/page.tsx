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
      const bonusMsg = res.bonusApplied ? ' 🔥 Bonus streak 10 ngày!' : '';
      alert(`🎉 Điểm danh thành công! +${res.earned || 3000} xu${bonusMsg}`);
      refreshData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi điểm danh');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  // G3 (wiki 0044/0045): hiển streak 10 ngày — 9 ngày thường 3000 xu + ngày 10 bonus 10000.
  // Trước đây hiển weekday Mon-Sun (100/150/.../1000) khớp BE cũ. BE mới thay đổi
  // sang streak-based, FE update tương ứng.
  const DAYS_PER_CYCLE = 10;
  const streakDays = Array.from({ length: DAYS_PER_CYCLE }, (_, i) => ({
    day: i + 1,
    label: `Ngày ${i + 1}`,
    reward: 3000 + (i + 1 === DAYS_PER_CYCLE ? 10000 : 0),
    isBig: i + 1 === DAYS_PER_CYCLE,
  }));

  if (!pointInfo) return <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>;

  // Vị trí hiện tại trong cycle 10 ngày (streak modulo)
  const currentStreak = pointInfo.streak || 0;
  const currentInCycle = currentStreak === 0 ? 0 : ((currentStreak - 1) % DAYS_PER_CYCLE) + 1;

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 2. CỘT TRÁI: Điểm danh */}
        <div>

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

                {/* Timeline streak 10 ngày */}
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {streakDays.map((item) => {
                        const isToday = item.day === currentInCycle + (pointInfo.isCheckedInToday ? 0 : 1);
                        const isChecked = item.day <= currentInCycle;

                        return (
                            <div key={item.day} className={`
                                relative flex flex-col items-center p-2 rounded-xl border transition-all
                                ${isToday ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-200' : 'border-gray-100 bg-white'}
                                ${item.isBig ? 'bg-gradient-to-br from-orange-50 to-yellow-50' : ''}
                            `}>
                                <span className="text-[10px] font-bold text-gray-500 mb-1">{item.label}</span>
                                {item.isBig ? (
                                    <Gift size={20} className={isChecked ? "text-orange-500" : "text-orange-300"} />
                                ) : (
                                    <Coins size={16} className={isChecked ? "text-yellow-500" : "text-gray-300"} />
                                )}
                                <span className={`text-[9px] font-bold mt-1 ${item.isBig ? 'text-orange-600' : 'text-gray-600'}`}>
                                    +{item.reward.toLocaleString()}
                                </span>
                                {isChecked && (
                                    <div className="absolute top-1 right-1">
                                        <CheckCircle2 size={10} className="text-green-500" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>

        {/* CỘT PHẢI: Vòng quay may mắn */}
        <div className={`transition-all duration-500 ${!pointInfo.hasSpunToday ? 'ring-2 ring-purple-400 ring-offset-2 rounded-xl' : ''}`}>
            <LuckyWheel onSpinSuccess={refreshData} />
        </div>

      </div>

      {/* #52 (wiki 0044/0045): bảng lịch sử điểm dạng table với cột rõ ràng
          ID đơn / Ngày / Điểm / Lý do — theo spec Require GMall §8.
          Trước đây là card scroll list compact bên cột phải, không phải table. */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <History className="text-gray-500" size={20}/>
              <h3 className="font-bold text-gray-800">Lịch sử điểm thưởng</h3>
              <span className="ml-auto text-xs text-gray-400">{history.length} giao dịch gần nhất</span>
          </div>

          {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Clock size={48} className="mb-3 opacity-20"/>
                  <p className="text-sm">Chưa có giao dịch nào</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                          <tr>
                              <th className="px-4 py-3 font-semibold w-[140px]">Ngày</th>
                              <th className="px-4 py-3 font-semibold w-[140px]">Loại</th>
                              <th className="px-4 py-3 font-semibold">Lý do</th>
                              <th className="px-4 py-3 font-semibold w-[120px]">Mã đơn / Ref</th>
                              <th className="px-4 py-3 font-semibold text-right w-[110px]">Điểm</th>
                          </tr>
                      </thead>
                      <tbody>
                          {history.map((item) => {
                              const isEarn = item.type?.includes('EARN');
                              const refId = item.referenceId || item.refId || '—';
                              return (
                                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                          {new Date(item.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                                      </td>
                                      <td className="px-4 py-3">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isEarn ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                              {isEarn ? <ArrowDownCircle size={12}/> : <ArrowUpCircle size={12}/>}
                                              {isEarn ? 'Cộng' : 'Trừ'}
                                          </span>
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">{item.description || '—'}</td>
                                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{refId}</td>
                                      <td className={`px-4 py-3 text-right font-bold ${isEarn ? 'text-green-600' : 'text-gray-800'}`}>
                                          {isEarn ? '+' : '-'}{item.amount?.toLocaleString() || 0}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
}