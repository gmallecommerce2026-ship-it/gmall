// src/modules/cart/components/CartListHeader.tsx
import React from "react";
import TrashBinIcon from "@/icons/trash.svg";

const CartListHeader = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg font-semibold text-gray-700 text-sm">
      {/* Checkbox "chọn tất cả" */}
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-gray-400 text-brand-orange focus:ring-brand-orange focus:ring-2 focus:ring-offset-0"
      />
      
      {/* Tên sản phẩm (chiếm không gian) */}
      <div className="flex-1">Sản phẩm</div>
      
      {/* Các cột cố định */}
      <div className="w-40 text-right">Đơn giá</div>
      <div className="w-32 text-center">Số lượng</div>
      <div className="w-40 text-right">Số tiền</div>
      <div className="w-12 text-center" aria-label="Xoá">
        <TrashBinIcon className="w-5 h-5 mx-auto text-gray-400" />
      </div>
    </div>
  );
};

export default CartListHeader;