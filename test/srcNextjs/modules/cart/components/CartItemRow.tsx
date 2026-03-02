// src/modules/cart/components/CartItemRow.tsx
"use client";

import React from "react";
import { CartItem } from "@/types/cart";
import Link from "next/link";
import QuantitySelector from "@/modules/product-details/components/QuantitySelector"; 
// Icon SVG - Đảm bảo bạn đã có icon này hoặc thay bằng heroicons
const TrashBinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

interface CartItemRowProps {
  item: CartItem;
  isSelected: boolean;
  onToggle: () => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const CartItemRow: React.FC<CartItemRowProps> = ({ 
  item, 
  isSelected, 
  onToggle, 
  onQuantityChange, 
  onRemove 
}) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 py-4 group">
      
      {/* Checkbox */}
      <div className="flex-shrink-0">
         <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="h-5 w-5 rounded border-gray-300 accent-orange-500 cursor-pointer"
        />
      </div>

      {/* Product Image */}
      <div className="flex flex-1 items-center gap-4 min-w-[200px]">
        <Link href={`/product-details/${item.productId}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
           <img
            src={item.imageUrl || '/placeholder.png'} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </Link>
       
        {/* Info */}
        <div className="flex flex-col gap-1 pr-4">
          <Link href={`/product-details/${item.productId}`}>
             <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors cursor-pointer" title={item.title}>
                {item.title}
             </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
             {item.variantName ? (
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.variantName}</span>
             ) : (
                <>
                    {item.color && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Màu: {item.color}</span>}
                    {item.size && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Size: {item.size}</span>}
                </>
             )}
          </div>
          {item.stock <= 5 && (
             <span className="text-xs text-red-500 font-medium mt-0.5">
               🔥 Chỉ còn {item.stock} sản phẩm
             </span>
          )}
        </div>
      </div>

      {/* Đơn giá */}
      <div className="flex flex-col items-end w-full md:w-28 flex-shrink-0 pl-8 md:pl-0 md:items-start">
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(item.price)}
        </span>
      </div>

      {/* Số lượng */}
      <div className="w-full md:w-32 flex justify-start md:justify-center flex-shrink-0 pl-8 md:pl-0">
        <QuantitySelector
          quantity={item.quantity}
          onChange={(newQty) => onQuantityChange(item.id, newQty)}
          max={item.stock} // Giới hạn max theo stock
        />
      </div>

      {/* Thành tiền */}
      <div className="w-full md:w-32 text-right flex-shrink-0 pl-8 md:pl-0 hidden md:block">
        <span className="text-sm font-bold text-orange-600">
          {formatCurrency(item.price * item.quantity)}
        </span>
      </div>

      {/* Nút Xoá */}
      <div className="w-10 text-center flex-shrink-0 ml-auto md:ml-0">
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
          title="Xoá sản phẩm"
        >
          <TrashBinIcon />
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;