'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Gift, X, Loader2, Music } from 'lucide-react'; // Thêm icon Loader2
import { pointService } from '@/services/point.service';

interface LuckyWheelProps {
  onSpinSuccess: () => void;
  onClose?: () => void;
}

// Cấu hình vòng quay (8 phần)
const SEGMENTS = [
  { label: 'Trượt', color: '#EF4444', text: '#fff', value: 0 },
  { label: '100 Xu', color: '#F59E0B', text: '#fff', value: 100 },
  { label: 'Trượt', color: '#EF4444', text: '#fff', value: 0 },
  { label: '1000 Xu', color: '#8B5CF6', text: '#fff', value: 1000 }, 
  { label: 'Trượt', color: '#EF4444', text: '#fff', value: 0 },
  { label: '100 Xu', color: '#F59E0B', text: '#fff', value: 100 },
  { label: 'Trượt', color: '#EF4444', text: '#fff', value: 0 },
  { label: '100 Xu', color: '#F59E0B', text: '#fff', value: 100 },
];

const LuckyWheel: React.FC<LuckyWheelProps> = ({ onSpinSuccess, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái đang gọi API
  const [isSpinning, setIsSpinning] = useState(false);     // Trạng thái đang quay animation
  const [rotation, setRotation] = useState(0);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  // Tính toán background gradient động dựa trên SEGMENTS
  // Kết quả: conic-gradient(màu1 0% 12.5%, màu2 12.5% 25%, ...)
  const wheelGradient = `conic-gradient(
    ${SEGMENTS.map((seg, i) => {
      const start = (i * 100) / SEGMENTS.length;
      const end = ((i + 1) * 100) / SEGMENTS.length;
      return `${seg.color} ${start}% ${end}%`;
    }).join(', ')}
  )`;

  const handleSpin = async () => {
    if (isProcessing || isSpinning) return;
    
    // 1. Feedback ngay lập tức: Hiện loading spinner
    setIsProcessing(true); 
    setResultMsg(null);

    try {
      // 2. Gọi API
      const data = await pointService.playGacha();
      // Giả sử data = { won: true, reward: 100 }
      
      setIsProcessing(false); // Tắt loading, bắt đầu quay
      setIsSpinning(true);

      // R3-4 (wiki 0045): drive UI bằng `data.won` từ BE thay vì `reward > 0`.
      // BE return shape: { won, reward, message }. Trước đây nếu BE trả reward
      // value không nằm trong SEGMENTS (vd 105 trong khi SEGMENTS chỉ có 0/100/1000)
      // → targetIndexes = [] → finalIndex = undefined → wheel rotate NaN → kim
      // dừng vị trí ngẫu nhiên (visual) nhưng message FE vẫn nói "Chúc may mắn"
      // → user bối rối "trúng nhưng bảo trượt".
      let targetIndexes: number[] = [];
      if (data.won && data.reward > 0) {
        targetIndexes = SEGMENTS.map((s, i) => s.value === data.reward ? i : -1).filter(i => i !== -1);
        // Fallback: SEGMENTS không có ô khớp value → random ô có value > 0 (mọi ô trúng)
        if (targetIndexes.length === 0) {
          targetIndexes = SEGMENTS.map((s, i) => s.value > 0 ? i : -1).filter(i => i !== -1);
          console.warn(`[LuckyWheel] SEGMENTS không có ô value=${data.reward}, fallback ô trúng bất kỳ`);
        }
      } else {
        targetIndexes = SEGMENTS.map((s, i) => s.value === 0 ? i : -1).filter(i => i !== -1);
      }

      // Defensive: nếu vẫn rỗng (vd SEGMENTS toàn ô trúng mà BE bảo trượt) → ô 0
      if (targetIndexes.length === 0) targetIndexes = [0];
      const finalIndex = targetIndexes[Math.floor(Math.random() * targetIndexes.length)];

      // 4. Tính toán góc quay
      // Góc của 1 ô
      const segmentAngle = 360 / SEGMENTS.length; 
      
      // Để kim chỉ vào GIỮA ô:
      // Mặc định CSS quay từ 0 độ (góc 12h).
      // Chúng ta muốn ô `finalIndex` nằm ở vị trí kim (12h).
      // Công thức: Quay ngược lại (360 - góc của ô đó)
      
      const stopAngle = 360 - (finalIndex * segmentAngle) - (segmentAngle / 2);

      // Thêm 5 vòng quay (1800 độ) + góc dừng + random nhẹ (-10 đến +10 độ cho tự nhiên)
      const randomOffset = Math.floor(Math.random() * 20) - 10; 
      const newRotation = rotation + 1800 + stopAngle + randomOffset;

      setRotation(newRotation);

      // 5. Kết thúc quay (4s sau)
      setTimeout(() => {
        setIsSpinning(false);
        if (data.won && data.reward > 0) {
            setResultMsg(`🎉 +${data.reward} Xu`);
        } else {
            // Dùng message từ BE (nếu có) để consistency, fallback hardcode
            setResultMsg(data.message || "😅 Chúc may mắn lần sau");
        }
        
        // Đợi thêm 1 chút để người dùng đọc kết quả rồi mới đóng/refresh
        setTimeout(() => {
             onSpinSuccess();
        }, 1500);

      }, 4000); // Khớp với transition duration

    } catch (error: any) {
      setIsProcessing(false);
      setIsSpinning(false);
      const msg = error?.code === 'ECONNABORTED'
        ? 'Quá thời gian chờ, vui lòng thử lại'
        : (error?.response?.data?.message || error?.message || 'Lỗi kết nối server');
      setResultMsg(`⚠ ${msg}`);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Nút đóng */}
      {onClose && (
        <button onClick={onClose} className="absolute -top-2 -right-2 p-2 bg-white/90 rounded-full text-gray-500 shadow-sm z-50 hover:bg-white hover:text-red-500 transition-colors">
           <X size={24} />
        </button>
      )}

      {/* Tiêu đề */}
      <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 uppercase drop-shadow-sm flex items-center gap-2 justify-center">
             <Gift className="text-pink-500" /> Vòng Quay May Mắn
          </h2>
          <p className="text-white/80 text-sm">Quay là trúng - Rinh quà khủng</p>
      </div>

      <div className="relative">
        {/* Kim chỉ vị trí (Mũi tên đỏ) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-lg">
             <div className="w-8 h-10 bg-red-600" style={{ clipPath: 'polygon(100% 0, 50% 100%, 0 0)' }}></div>
        </div>

        {/* Khung ngoài vòng quay (Border) */}
        <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 p-2 shadow-2xl shadow-purple-900/50 relative">
            
            {/* Vòng quay chính */}
            <div 
                className="w-full h-full rounded-full relative overflow-hidden transition-transform cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{ 
                    background: wheelGradient,
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? '4000ms' : '0ms' 
                }}
            >
                {/* Vẽ các đường kẻ ngăn cách & Text */}
                {SEGMENTS.map((seg, i) => (
                    <div 
                        key={i}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ transform: `rotate(${i * (360 / SEGMENTS.length)}deg)` }}
                    >
                        {/* Đường kẻ trắng ngăn cách */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 bg-white/20 origin-bottom"></div>
                        
                        {/* Text (Căn chỉnh vào giữa múi) */}
                        <div 
                            className="absolute top-4 left-1/2 -translate-x-1/2 text-center pt-4 font-bold text-white text-sm drop-shadow-md origin-center"
                            style={{ 
                                transform: `rotate(${180 / SEGMENTS.length}deg)`, // Xoay nhẹ để text nằm giữa múi
                                width: '60px'
                            }}
                        >
                            <span className="block transform rotate-180 uppercase tracking-tighter" style={{ writingMode: 'vertical-rl' }}>
                                {seg.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nút quay ở tâm */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-20 h-20 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] flex items-center justify-center z-20 border-[6px] border-purple-100">
                <button 
                    onClick={handleSpin}
                    disabled={isProcessing || isSpinning}
                    className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 text-white font-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-80 disabled:cursor-not-allowed group"
                >
                    {isProcessing ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                        <>
                            <span className="text-xs font-normal opacity-80 mb-[-2px]">NHẤN</span>
                            <span className="text-lg">QUAY</span>
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Thông báo kết quả */}
      <div className="h-12 mt-6 flex items-center justify-center">
          {resultMsg ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-yellow-300 font-bold animate-in fade-in zoom-in">
                  {resultMsg}
              </div>
          ) : (
             <div className="text-white/40 text-sm italic">
                {isProcessing ? 'Đang chuẩn bị...' : isSpinning ? 'Đang quay...' : 'Mỗi ngày 1 lượt miễn phí'}
             </div>
          )}
      </div>
    </div>
  );
};

export default LuckyWheel;