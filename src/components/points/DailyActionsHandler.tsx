'use client';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { pointService } from '@/services/point.service';
import CheckInModal from './CheckInModal';
import LuckyWheelModal from './LuckyWheelModal';
import DevResetButton from './DevResetButton';
type Step = 'NONE' | 'CHECK_IN' | 'LUCKY_WHEEL';

const DailyActionsHandler = () => {
  const { isAuthenticated } = useUserStore();
  const [step, setStep] = useState<Step>('NONE');
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Chỉ chạy khi đã login và chưa check trong phiên này
    if (!isAuthenticated || sessionChecked) return;

    const checkServerStatus = async () => {
      try {
        const data = await pointService.getDailyStatus();
        
        // Log ra để debug xem backend trả về gì
        console.log("Daily Status:", data); 

        // Ưu tiên 1: Chưa điểm danh -> Hiện modal điểm danh
        if (!data.isCheckedInToday) {
           setStep('CHECK_IN');
        } 
        // Ưu tiên 2: Đã điểm danh rồi NHƯNG chưa quay -> Hiện modal quay
        else if (!data.hasSpunToday) {
           setStep('LUCKY_WHEEL');
        }
        
        setSessionChecked(true);
      } catch (error) {
        console.error("Lỗi check trạng thái daily:", error);
      }
    };

    checkServerStatus();
  }, [isAuthenticated, sessionChecked]);

  const handleCheckInSuccess = () => {
    // Sau khi checkin thành công, backend đã ghi nhận.
    // Chuyển sang Lucky Wheel ngay lập tức.
    setStep('LUCKY_WHEEL'); 
  };

  const handleClose = () => {
    setStep('NONE');
  };

  return (
    <>
      <CheckInModal 
        isOpen={step === 'CHECK_IN'} 
        onClose={handleClose} 
        onSuccess={handleCheckInSuccess} 
      />

      <LuckyWheelModal 
        isOpen={step === 'LUCKY_WHEEL'} 
        onClose={handleClose}
        onSpinSuccess={handleClose} 
      />

      <DevResetButton />
    </>
  );
};

export default DailyActionsHandler;