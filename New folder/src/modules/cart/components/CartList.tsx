// src/modules/cart/components/CartList.tsx
"use client";

import React from "react";
import { CartItem } from "@/types/cart";
import CartListHeader from "./CartListHeader";
import CartItemRow from "./CartItemRow";

interface CartListProps {
  items: CartItem[];
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

const CartList: React.FC<CartListProps> = ({
  items,
  onQuantityChange,
  onRemove,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
      {/* Header của danh sách */}
      <CartListHeader />
      
      {/* Danh sách sản phẩm */}
      <div className="flex flex-col divide-y divide-gray-200">
        {items.length > 0 ? (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        ) : (
          <p className="p-6 text-center text-gray-500">
            Giỏ hàng của bạn đang trống.
          </p>
        )}
      </div>
    </div>
  );
};

export default CartList;