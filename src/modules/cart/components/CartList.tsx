// src/modules/cart/components/CartList.tsx
"use client";

import React, { useMemo } from "react";
import { CartItem } from "@/types/cart";
import CartShopBlock from "./CartShopBlock";

interface CartListProps {
  items: CartItem[];
  selectedIds: string[];
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  onToggleItem: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleShop: (shopId: string, itemIds: string[], checked: boolean) => void;
  // wiki 0108: nút "Xóa mục đã chọn" trước đây KHÔNG có `onClick` — bấm không xoá gì,
  // không gọi API, không báo lỗi. Store đã sẵn `removeMultipleItems`, chỉ thiếu đường nối.
  onRemoveSelected: () => void;
}

const CartList: React.FC<CartListProps> = ({
  items,
  selectedIds,
  onQuantityChange,
  onRemove,
  onToggleItem,
  onToggleAll,
  onToggleShop,
  onRemoveSelected
}) => {
  // Gom nhóm items theo ShopId
  const groupedItems = useMemo(() => {
    const groups: Record<string, { shopName: string; shopId: string; items: CartItem[] }> = {};
    
    items.forEach((item) => {
      // Fallback shopId nếu backend trả về null
      const sId = item.shopId || 'unknown-shop';
      if (!groups[sId]) {
        groups[sId] = {
          shopId: sId,
          shopName: item.shopName || "Cửa hàng",
          items: [],
        };
      }
      groups[sId].items.push(item);
    });
    
    return Object.values(groups);
  }, [items]);

  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id));

  return (
    <div className="flex flex-col gap-4">
      {/* Global Header: Chọn tất cả */}
      <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center gap-3 border border-gray-100 sticky top-[70px] z-10 lg:static">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => onToggleAll(e.target.checked)}
          className="w-5 h-5 accent-orange-500 cursor-pointer"
        />
        <span className="font-medium text-gray-700">Chọn tất cả ({items.length} sản phẩm)</span>
        
        {/* Nút xóa nhanh các món đã chọn (Optional feature) */}
        {selectedIds.length > 0 && (
            <button
                onClick={() => {
                    // Thao tác phá huỷ và không hoàn tác được → hỏi lại trước khi xoá.
                    if (window.confirm(`Xoá ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng?`)) {
                        onRemoveSelected();
                    }
                }}
                className="ml-auto text-red-500 text-sm hover:underline font-medium"
            >
                Xóa mục đã chọn ({selectedIds.length})
            </button>
        )}
      </div>

      {/* Render từng Shop Block */}
      {groupedItems.map((group) => (
         <CartShopBlock 
            key={group.shopId}
            shopId={group.shopId}
            shopName={group.shopName}
            items={group.items}
            selectedIds={selectedIds}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            onToggleItem={(id) => onToggleItem(id)}
            onToggleShop={onToggleShop}
         />
      ))}
    </div>
  );
};

export default CartList;