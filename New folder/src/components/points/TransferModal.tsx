'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; // Hoặc library toast bạn đang dùng
import { pointService } from '@/services/point.service';
import useUserStore from '@/store/useUserStore'; // Store chứa thông tin user hiện tại

interface TransferModalProps {
  receiver: { id: string; name: string; avatar?: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({ receiver, isOpen, onClose, onSuccess }: TransferModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user, fetchUserProfile } = useUserStore(); // Lấy user để check số dư

  if (!isOpen || !receiver) return null;

  const currentBalance = user?.points || 0; // Giả sử user store có field points

  const handleTransfer = async () => {
    const numAmount = Number(amount);

    // Validate Frontend
    if (!amount || numAmount <= 0) {
      toast.error('Số xu chuyển phải lớn hơn 0');
      return;
    }
    if (numAmount > currentBalance) {
      toast.error('Số dư không đủ để thực hiện giao dịch');
      return;
    }

    try {
      setLoading(true);
      await pointService.transferPoints({
        receiverId: receiver.id,
        amount: numAmount,
      });
      
      toast.success(`Đã chuyển ${numAmount} xu cho ${receiver.name}!`);
      fetchUserProfile(); // Reload lại user để cập nhật số dư mới
      onSuccess();
      onClose();
      setAmount('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Chuyển xu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white">
          <h3 className="text-lg font-bold">Chuyển Xu Lì Xì</h3>
          <p className="text-sm opacity-90">Gửi tặng xu cho bạn bè</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
              {receiver.avatar ? <img src={receiver.avatar} alt={receiver.name} className="w-full h-full rounded-full"/> : receiver.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-gray-500">Người nhận</p>
              <p className="font-semibold text-gray-800">{receiver.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số xu muốn chuyển (Số dư: <span className="text-orange-600 font-bold">{currentBalance.toLocaleString()}</span>)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số xu..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-sm">XU</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
          >
            Hủy
          </button>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}