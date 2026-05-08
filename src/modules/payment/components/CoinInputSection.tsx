import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';

export const CoinInputSection = () => {
  const { user } = useUserStore();
  const { appliedCoins, setAppliedCoins } = useCheckoutStore();
  
  // Tổng xu tối đa user đang có
  const maxCoins = user?.point || 0;
  
  // Trạng thái bật/tắt dùng xu
  const [isUsingCoins, setIsUsingCoins] = useState(appliedCoins > 0);
  const [inputValue, setInputValue] = useState(appliedCoins.toString());

  // Đồng bộ với input khi tắt toggle
  // hooks-fix wiki 0031: setInputValue là local form sync; legitimate
  useEffect(() => {
    if (!isUsingCoins) {
      setAppliedCoins(0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue('0');
    }
  }, [isUsingCoins, setAppliedCoins]);

  // Xử lý khi user nhập tay vào ô input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
    
    if (isNaN(val)) val = 0;
    
    // Giới hạn không cho nhập quá số xu đang có
    if (val > maxCoins) {
      val = maxCoins;
    }

    setInputValue(val.toString());
    setAppliedCoins(val);
    
    if (val > 0) {
      setIsUsingCoins(true);
    }
  };

  // Nút áp dụng nhanh toàn bộ xu
  const handleApplyAll = () => {
    setInputValue(maxCoins.toString());
    setAppliedCoins(maxCoins);
    setIsUsingCoins(true);
  };

  if (maxCoins === 0) return null; // Không hiển thị nếu user không có xu

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mt-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-xl">🪙</span>
          <h3 className="font-nunito text-base font-bold text-black">
            Dùng G-Mall Xu
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Khả dụng: <strong className="text-orange-600">{maxCoins.toLocaleString('vi-VN')}</strong>
          </span>
          {/* Toggle Switch */}
          <button 
            onClick={() => setIsUsingCoins(!isUsingCoins)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
              isUsingCoins ? 'bg-orange-600' : 'bg-gray-300'
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              isUsingCoins ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {isUsingCoins && (
        <div className="flex items-center gap-3 mt-3 animate-fade-in">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-poppins focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Nhập số xu muốn dùng..."
          />
          <button 
            onClick={handleApplyAll}
            className="px-4 py-2 bg-orange-100 text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-200 transition-colors"
          >
            Dùng tất cả
          </button>
        </div>
      )}
    </div>
  );
};