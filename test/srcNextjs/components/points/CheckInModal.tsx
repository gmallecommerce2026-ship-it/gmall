'use client';
import React, { useState, useEffect } from 'react';
import { pointService } from '@/services/point.service';
import { X, Check, Loader2, Gift } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REWARDS = [100, 150, 200, 250, 300, 400, 1000]; // Map với Backend

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0); // 0-based index

  useEffect(() => {
    if (isOpen) {
      // Lấy streak hiện tại từ server để hiển thị đúng ô
      pointService.getDailyStatus().then((res: any) => {
         // Giả sử backend trả về currentStreak (1-based), ta trừ 1 để map vào array
         // Nếu chưa checkin hôm nay, streak hiển thị sẽ là streak cũ. 
         // Logic hiển thị: Nếu chưa checkin, ta highlight ô (streak hiện tại).
         setStreak(res.currentStreak || 0);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const data = await pointService.checkIn();
      // data trả về: reward, streak, message
      onSuccess(); 
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Lỗi điểm danh');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-gradient-to-b from-blue-900 to-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-blue-500/30">
        
        {/* Header */}
        <div className="relative p-6 text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 uppercase tracking-wider">
                Điểm Danh 7 Ngày
            </h2>
            <p className="text-blue-200 text-sm mt-1">Nhận quà mỗi ngày, ngày 7 nổ hũ!</p>
        </div>

        {/* Grid Quà Tặng */}
        <div className="px-6 pb-6">
            <div className="grid grid-cols-4 gap-3 mb-3">
                {REWARDS.slice(0, 4).map((point, index) => (
                    <DayCard key={index} day={index + 1} point={point} active={index === streak} passed={index < streak} />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
                 {REWARDS.slice(4, 7).map((point, index) => {
                    const realIndex = index + 4;
                    const isBigGift = realIndex === 6; // Ngày 7
                    return (
                        <DayCard 
                            key={realIndex} 
                            day={realIndex + 1} 
                            point={point} 
                            active={realIndex === streak} 
                            passed={realIndex < streak}
                            isBig={isBigGift}
                        />
                    );
                 })}
            </div>
        </div>

        {/* Button Action */}
        <div className="p-6 pt-0">
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-red-900 font-black text-lg rounded-2xl shadow-lg shadow-orange-500/20 transform transition active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'ĐIỂM DANH NGAY'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component con hiển thị từng ngày
const DayCard = ({ day, point, active, passed, isBig = false }: any) => {
    return (
        <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300
            ${isBig ? 'col-span-1 bg-yellow-900/40 border-yellow-500/50 aspect-square' : 'aspect-[3/4]'}
            ${active ? 'bg-blue-600/40 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-105 z-10' : ''}
            ${passed ? 'bg-slate-800/50 border-slate-700 opacity-60' : 'bg-slate-800/40 border-slate-700'}
        `}>
            {passed && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl z-20">
                    <Check className="text-green-400 w-8 h-8 stroke-[3]" />
                </div>
            )}
            
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Ngày {day}</span>
            
            <div className={`${isBig ? 'w-12 h-12 text-yellow-400' : 'w-8 h-8 text-blue-400'} mb-1 drop-shadow-lg`}>
                <Gift className="w-full h-full" />
            </div>

            <span className={`font-bold ${isBig ? 'text-yellow-300 text-sm' : 'text-white text-xs'}`}>
                +{point}
            </span>
        </div>
    )
}

export default CheckInModal;