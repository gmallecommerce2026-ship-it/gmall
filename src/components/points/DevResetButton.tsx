'use client';
import React from 'react';
import { pointService } from '@/services/point.service';
import { RotateCcw } from 'lucide-react'; 

const DevResetButton = () => {
  const handleReset = async () => {
    if (!confirm('Bạn có chắc muốn Reset trạng thái điểm danh hôm nay để test lại?')) return;
    
    try {
      await pointService.resetDaily();
      alert('✅ Đã reset thành công! Trang sẽ tải lại ngay.');
      window.location.reload(); // Tải lại trang để hiện Popup
    } catch (error) {
      console.error(error);
      alert('❌ Lỗi: Không thể reset (Kiểm tra lại Backend đã có API reset-test chưa?)');
    }
  };

  return (
    <button 
      onClick={handleReset}
      className="fixed bottom-5 left-5 z-[10000] flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
      title="Reset Daily Checkin (Dành cho Developer)"
    >
      <RotateCcw size={20} />
      <span className="font-bold text-sm">Reset Test</span>
    </button>
  );
};

export default DevResetButton;