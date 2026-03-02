'use client';
import React from 'react';
import LuckyWheel from './LuckyWheel';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinSuccess?: () => void;
}

const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({ isOpen, onClose, onSpinSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Click ra ngoài để đóng nếu muốn: onClick={onClose} */}
      <div className="relative w-full max-w-md flex justify-center animate-in zoom-in-95 duration-200">
        {/* Truyền callback onClose vào để LuckyWheel có nút X tắt popup */}
        <LuckyWheel 
            onSpinSuccess={onSpinSuccess || (() => {})} 
            onClose={onClose} 
        />
      </div>
    </div>
  );
};

export default LuckyWheelModal;