// src/modules/cart/components/CartShopBlock.tsx
import React from "react";
import Link from "next/link";
import { CartItem } from "@/types/cart";
import CartItemRow from "./CartItemRow";

interface CartShopBlockProps {
  shopId: string;
  shopName: string;
  items: CartItem[];
  selectedIds: string[];
  // Store chỉ cần ID để toggle, không cần event phức tạp ở mức này trừ khi muốn logic Shift+Click nâng cao
  onToggleItem: (id: string) => void; 
  onToggleShop: (shopId: string, itemIds: string[], checked: boolean) => void;
  onQuantityChange: (id: string, q: number) => void;
  onRemove: (id: string) => void;
}

const CartShopBlock: React.FC<CartShopBlockProps> = ({
  shopId,
  shopName,
  items,
  selectedIds,
  onToggleItem,
  onToggleShop,
  onQuantityChange,
  onRemove
}) => {
  // Shop được coi là selected nếu TẤT CẢ item con đều nằm trong selectedIds
  const isShopSelected = items.length > 0 && items.every(i => selectedIds.includes(i.id));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* 1. Header Shop Checkbox */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <input
          type="checkbox"
          checked={isShopSelected}
          onChange={(e) => onToggleShop(shopId, items.map(i => i.id), e.target.checked)}
          className="w-5 h-5 accent-orange-500 cursor-pointer"
        />
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <Link href={`/shop/${shopId}`} className="font-bold text-gray-800 hover:text-orange-600 transition-colors">
            {shopName}
          </Link>
          <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </div>
      </div>

      {/* 2. List Items */}
      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="pl-4 pr-4 py-2 hover:bg-orange-50/5 transition-colors">
             <CartItemRow
                item={item}
                isSelected={selectedIds.includes(item.id)}
                onToggle={() => onToggleItem(item.id)} 
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
             />
          </div>
        ))}
      </div>

      {/* 3. Shop Voucher Section */}
      <div className="px-4 py-3 border-t border-dashed border-gray-200 flex items-center justify-between bg-[#FAFBFC] text-sm">
         <div className="flex items-center gap-2 text-orange-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            <span className="font-medium">Shop Voucher</span>
         </div>
         <button className="text-blue-600 hover:underline cursor-pointer text-xs font-medium bg-blue-50 px-3 py-1 rounded-full">
            Lưu mã giảm giá
         </button>
      </div>
    </div>
  );
};

export default CartShopBlock;