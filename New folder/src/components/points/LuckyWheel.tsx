'use client';
import React, { useState } from 'react';
import { Gift, RefreshCw } from 'lucide-react';
import { pointService } from '@/services/point.service';
import Button from '@/components/ui/Button';

interface LuckyWheelProps {
  onSpinSuccess: () => void; // Callback để reload điểm ở cha
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ onSpinSuccess }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    try {
      // 1. Gọi API lấy kết quả trước
      const data = await pointService.playGacha();
      
      // 2. Tính toán góc quay (Giả lập hiệu ứng hình ảnh)
      // Quay ít nhất 5 vòng (1800 độ) + random
      const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
      setRotation(newRotation);

      // 3. Đợi animation kết thúc (ví dụ 3s) rồi hiện kết quả
      setTimeout(() => {
        setIsSpinning(false);
        if (data.won) {
          alert(`🎉 Chúc mừng! Bạn nhận được ${data.reward} xu.`);
        } else {
          alert(`😅 Tiếc quá! ${data.message}`);
        }
        onSpinSuccess(); // Reload lại số dư ở component cha
      }, 3000);

    } catch (error: any) {
      setIsSpinning(false);
      alert(error.response?.data?.message || 'Không thể quay thưởng lúc này');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
      <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Gift className="text-purple-500" /> Vòng Quay May Mắn
      </h2>
      <p className="text-sm text-gray-500 mb-6">Thử vận may - Nhận xu mỗi ngày</p>

      {/* Vòng quay Visual */}
      <div className="relative w-64 h-64 mb-6">
        {/* Kim chỉ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-20">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md"></div>
        </div>

        {/* Đĩa quay */}
        <div 
          className="w-full h-full rounded-full border-4 border-orange-400 bg-gradient-to-tr from-yellow-100 to-yellow-300 shadow-inner relative transition-transform duration-[3000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
            {/* Các nan quạt trang trí */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-orange-600 text-opacity-20 text-4xl">GMALL</span>
            </div>
            {/* Các chấm tròn trang trí xung quanh */}
            {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute w-3 h-3 bg-white rounded-full top-2 left-1/2 -translate-x-1/2 origin-[50%_120px]" style={{ transform: `rotate(${i * 45}deg)` }} />
            ))}
        </div>
        
        {/* Nút quay ở giữa */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
             <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-16 h-16 bg-white border-4 border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-600 shadow-lg active:scale-95 transition-transform"
             >
                {isSpinning ? <RefreshCw className="animate-spin" /> : 'QUAY'}
             </button>
        </div>
      </div>

      <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
         Phí tham gia: Miễn phí mỗi ngày 1 lần
      </div>
    </div>
  );
};

export default LuckyWheel;