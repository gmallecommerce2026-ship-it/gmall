// src/modules/cart/components/CartItemRow.tsx
"use client";

import React from "react";
import { CartItem } from "@/types/cart";
import TrashBinIcon from "@/icons/trash.svg";
import QuantitySelector from "@/modules/product-details/components/QuantitySelector"; 
import Link from "next/link";

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 px-4 py-6 hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0">
      
      {/* Checkbox (Để sau làm tính năng chọn thanh toán) */}
      <div className="flex-shrink-0">
         <input
            type="checkbox"
            defaultChecked
            className="h-5 w-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange cursor-pointer"
        />
      </div>

      {/* Product Image & Info */}
      <div className="flex flex-1 items-center gap-4 min-w-[200px]">
        <Link href={`/product-details/${item.productId}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
           <img
            src={item.imageUrl || '/assets/placeholder.png'} 
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
       
        <div className="flex flex-col gap-1 pr-4">
          <Link href={`/product-details/${item.productId}`}>
             <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-orange transition-colors cursor-pointer">
                {item.title}
             </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
             {/* Hiện tại DB chưa có color/size, dùng default hoặc ẩn đi */}
             <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">Màu: {item.color || 'Ngẫu nhiên'}</span>
             <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">Size: {item.size || 'F'}</span>
          </div>
          {/* Cảnh báo tồn kho thấp */}
          {item.stock <= 5 && (
             <span className="text-xs text-red-500 font-medium mt-1">
               🔥 Chỉ còn {item.stock} sản phẩm
             </span>
          )}
        </div>
      </div>

      {/* Đơn giá */}
      <div className="flex flex-col items-end w-full md:w-32 flex-shrink-0 pl-8 md:pl-0">
        <span className="text-base font-bold text-gray-900">
          {formatCurrency(item.price)}
        </span>
      </div>

      {/* Số lượng */}
      <div className="w-full md:w-32 flex justify-center flex-shrink-0 pl-8 md:pl-0">
        <QuantitySelector
          quantity={item.quantity}
          onChange={(newQty) => onQuantityChange(item.id, newQty)}
        />
      </div>

      {/* Thành tiền */}
      <div className="w-full md:w-36 text-right flex-shrink-0 pl-8 md:pl-0 hidden md:block">
        <span className="text-base font-bold text-brand-orange">
          {formatCurrency(item.price * item.quantity)}
        </span>
      </div>

      {/* Nút Xoá */}
      <div className="w-12 text-center flex-shrink-0">
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all"
          title="Xoá sản phẩm"
        >
          <TrashBinIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;