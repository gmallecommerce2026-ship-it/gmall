'use client';
import React, { useState, useEffect, useRef } from 'react';
import { pointService } from '@/services/point.service';
import { X, Check, Loader2, Gift } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Wiki 0048 (sync với G3 ở wiki 0046): mỗi ngày 3000 xu, ngày 10 bonus 10000.
// Trước đây 7 ngày Mon-Sun với rewards 100/150/.../1000 — KHÔNG khớp BE đã đổi.
const DAYS_PER_CYCLE = 10;
const DAILY_REWARD = 3000;
const STREAK_BONUS = 10000;
const REWARDS = Array.from({ length: DAYS_PER_CYCLE }, (_, i) =>
  i + 1 === DAYS_PER_CYCLE ? DAILY_REWARD + STREAK_BONUS : DAILY_REWARD
);

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0); // 0-based index (current position in cycle)
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  // Wiki 0068 B4: cleanup timer chuyển sang Lucky Wheel để tránh fire khi đã đóng modal.
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); }, []);

  useEffect(() => {
    if (isOpen) {
      setJustCheckedIn(false);
      pointService.getDailyStatus().then((res: any) => {
         // BE trả `currentStreak` 1-based. Modulo cycle để hiển vị trí trong 10 ngày.
         const s = res.streak || res.currentStreak || 0;
         setStreak(s === 0 ? 0 : ((s - 1) % DAYS_PER_CYCLE) + 1);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await pointService.checkIn();
      // Refetch streak từ BE (nay /events/status trả currentStreak — wiki 0068 B4)
      // để hiển ô ngày nhảy sang ngày kế tiếp.
      try {
        const res: any = await pointService.getDailyStatus();
        const s = res.streak || res.currentStreak || 0;
        setStreak(s === 0 ? 0 : ((s - 1) % DAYS_PER_CYCLE) + 1);
      } catch {/* ignore refetch error, BE đã ghi nhận checkin */}
      // Wiki 0068 B4: chờ 1.2s để user THẤY ngày vừa điểm danh (✓) + ngày kế được
      // highlight, rồi mới chuyển sang Lucky Wheel (trước đây onSuccess chạy ngay
      // → modal đóng tức thì, không nhìn thấy "nhảy qua ngày tiếp theo").
      setJustCheckedIn(true);
      setLoading(false);
      successTimerRef.current = setTimeout(() => onSuccess(), 1200);
      return;
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
                Điểm Danh 10 Ngày
            </h2>
            <p className="text-blue-200 text-sm mt-1">Mỗi ngày {DAILY_REWARD.toLocaleString()} xu — đủ {DAYS_PER_CYCLE} ngày liên tục thưởng thêm {STREAK_BONUS.toLocaleString()} xu!</p>
        </div>

        {/* Grid Quà Tặng — 5 cột × 2 hàng cho 10 ngày */}
        <div className="px-6 pb-6">
            <div className="grid grid-cols-5 gap-2">
                {REWARDS.map((point, index) => {
                    const isBigGift = index === DAYS_PER_CYCLE - 1; // Ngày 10
                    return (
                        <DayCard
                            key={index}
                            day={index + 1}
                            point={point}
                            active={index + 1 === streak + 1 || (streak === 0 && index === 0)}
                            passed={index < streak}
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
            disabled={loading || justCheckedIn}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-red-900 font-black text-lg rounded-2xl shadow-lg shadow-orange-500/20 transform transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-90"
          >
            {loading ? <Loader2 className="animate-spin" /> : justCheckedIn ? <><Check size={20} /> Đã điểm danh!</> : 'ĐIỂM DANH NGAY'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component con hiển thị từng ngày
const DayCard = ({ day, point, active, passed, isBig = false }: any) => {
    return (
        <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 aspect-square
            ${isBig ? 'bg-yellow-900/40 border-yellow-500/50' : ''}
            ${active ? 'bg-blue-600/40 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-105 z-10' : ''}
            ${passed ? 'bg-slate-800/50 border-slate-700 opacity-60' : 'bg-slate-800/40 border-slate-700'}
        `}>
            {passed && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl z-20">
                    <Check className="text-green-400 w-6 h-6 stroke-[3]" />
                </div>
            )}

            <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Ngày {day}</span>

            <div className={`${isBig ? 'w-7 h-7 text-yellow-400' : 'w-6 h-6 text-blue-400'} drop-shadow-lg`}>
                <Gift className="w-full h-full" />
            </div>

            <span className={`font-bold ${isBig ? 'text-yellow-300 text-[10px]' : 'text-white text-[9px]'} mt-0.5`}>
                +{point.toLocaleString()}
            </span>
        </div>
    )
}

export default CheckInModal;