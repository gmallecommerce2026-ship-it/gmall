// src/modules/cart/components/CartListHeader.tsx
"use client";

import React from "react";
import TrashBinIcon from "@/icons/trash.svg";

// [NEW] Thêm interface props để nhận trạng thái từ cha
interface CartListHeaderProps {
  isAllSelected: boolean;
  onToggleAll: () => void;
}

const CartListHeader: React.FC<CartListHeaderProps> = ({ isAllSelected, onToggleAll }) => {
  return (
    // [UI FIX] Ẩn header trên mobile (hidden) và chỉ hiện trên màn hình md trở lên (md:flex)
    // Mobile thường không cần header chi tiết, hoặc giao diện sẽ khác
    <div className="hidden md:flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg font-semibold text-gray-700 text-sm">
      
      {/* Checkbox "chọn tất cả" */}
      <div className="flex-shrink-0">
        <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleAll}
            className="h-5 w-5 rounded border-gray-400 text-brand-orange focus:ring-brand-orange focus:ring-2 focus:ring-offset-0 cursor-pointer"
            title="Chọn tất cả"
        />
      </div>
      
      {/* Tên sản phẩm (chiếm không gian còn lại) */}
      <div className="flex-1 min-w-[200px] pl-4">Sản phẩm</div>
      
      {/* Các cột cố định - Căn chỉnh độ rộng khớp với CartItemRow */}
      <div className="w-32 text-right">Đơn giá</div>
      <div className="w-32 text-center">Số lượng</div>
      <div className="w-36 text-right">Số tiền</div>
      <div className="w-12 text-center" aria-label="Xoá">
        <TrashBinIcon className="w-5 h-5 mx-auto text-gray-400" />
      </div>
    </div>
  );
};

export default CartListHeader;