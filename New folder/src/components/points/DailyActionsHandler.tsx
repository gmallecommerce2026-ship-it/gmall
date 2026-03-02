'use client';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { pointService } from '@/services/point.service';
import CheckInModal from './CheckInModal';
import LuckyWheelModal from './LuckyWheelModal';

type Step = 'NONE' | 'CHECK_IN' | 'LUCKY_WHEEL';

const DailyActionsHandler = () => {
  const { isAuthenticated } = useUserStore();
  const [step, setStep] = useState<Step>('NONE');
  const [hasCheckedToday, setHasCheckedToday] = useState(false); // State tạm trong phiên

  useEffect(() => {
    if (!isAuthenticated) return;

    // Hàm kiểm tra quyền lợi từ Server
    const checkServerStatus = async () => {
      try {
        // Gọi API lấy thông tin mới nhất
        const data: any = await pointService.getPointInfo(); // API này trả về { isCheckedInToday: boolean }
        
        // Logic điều hướng
        if (!data.isCheckedInToday && !hasCheckedToday) {
          // Nếu Server bảo chưa điểm danh -> Hiện Popup
          setStep('CHECK_IN');
        } else {
            // Đã điểm danh rồi thì thôi, không hiện gì cả (hoặc hiện Gacha nếu muốn)
            // Ở đây tôi để logic: Checkin xong -> Hiện Gacha
            // Nếu đã Checkin rồi thì ko tự hiện Gacha nữa để tránh phiền mỗi lần reload
        }
      } catch (error) {
        console.error("Không thể lấy thông tin điểm:", error);
      }
    };

    // Gọi ngay khi component mount
    checkServerStatus();

  }, [isAuthenticated, hasCheckedToday]);

  const handleCheckInSuccess = () => {
    setHasCheckedToday(true); // Đánh dấu trong RAM là đã xong để không gọi lại
    setStep('LUCKY_WHEEL'); // Chuyển sang Gacha
  };

  const handleClose = () => {
    setStep('NONE');
  };

  return (
    <>
      {/* Modal Điểm Danh */}
      <CheckInModal 
        isOpen={step === 'CHECK_IN'} 
        onClose={handleClose} 
        onSuccess={handleCheckInSuccess} 
      />

      {/* Modal Gacha */}
      <LuckyWheelModal 
        isOpen={step === 'LUCKY_WHEEL'} 
        onClose={handleClose} 
      />
    </>
  );
};

export default DailyActionsHandler;