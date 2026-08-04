"use client";

import React from "react";
import { ShieldCheck, Star, MessageSquare, Plus, Minus, ShoppingCart, Zap, Gift } from "lucide-react";
import { Product } from "@/types/product";
import { ShopProfileData } from "./ShopInfo";

interface StickyBuyBoxProps {
  product: Product;
  shopProfile: ShopProfileData | null;
  quantity: number;
  onQuantityChange: (q: number) => void;
  finalPrice: number;
  displayStock: number;
  isAddingCart: boolean;
  isGifting: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onGiftNow: () => void;
}

export const StickyBuyBox: React.FC<StickyBuyBoxProps> = ({
  product,
  shopProfile,
  quantity,
  onQuantityChange,
  finalPrice,
  displayStock,
  isAddingCart,
  isGifting,
  onAddToCart,
  onBuyNow,
  onGiftNow,
}) => {
  const subtotal = finalPrice * quantity;

  const formatPrice = (amount: number) => {
    if (!amount || isNaN(amount)) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Khối Mua Hàng Chính */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        {/* Thông tin Shop / Thương hiệu */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center">
              {shopProfile?.avatar ? (
                <img src={shopProfile.avatar} alt={shopProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-gray-500 text-sm">
                  {product.brand?.charAt(0) || "S"}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 text-sm truncate">
                  {shopProfile?.name || product.brand || "Cửa hàng chính hãng"}
                </span>
                <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                  <ShieldCheck size={11} /> OFFICIAL
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center text-yellow-500 font-semibold gap-0.5">
                  <Star size={12} fill="currentColor" /> {product.rating || "5.0"}
                </span>
                <span>•</span>
                <span>Đã bán {product.salesCount || 0}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors shrink-0"
            title="Chat với Shop"
          >
            <MessageSquare size={18} />
          </button>
        </div>

        {/* Số lượng */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Số lượng
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || displayStock === 0}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <Minus size={14} />
              </button>
              <input
                type="text"
                readOnly
                value={quantity}
                className="w-10 text-center font-bold text-sm bg-transparent outline-none text-gray-900"
              />
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(displayStock || 99, quantity + 1))}
                disabled={quantity >= (displayStock || 99) || displayStock === 0}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {displayStock > 0 ? `Còn ${displayStock} sản phẩm` : "Hết hàng"}
            </span>
          </div>
        </div>

        {/* Tạm tính */}
        <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Tạm tính</span>
          <span className="text-2xl font-extrabold text-brand-orange tracking-tight">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Nút hành động Mua hàng */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onBuyNow}
            disabled={displayStock === 0}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap size={16} fill="currentColor" />
            {displayStock === 0 ? "Tạm hết hàng" : "Mua ngay"}
          </button>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAddingCart || displayStock === 0}
            className="w-full h-11 border-2 border-brand-orange text-brand-orange bg-orange-50/50 hover:bg-orange-100 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            {isAddingCart ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>

          <button
            type="button"
            onClick={onGiftNow}
            disabled={isGifting || displayStock === 0}
            className="w-full h-10 border border-dashed border-gray-300 hover:border-brand-orange text-gray-600 hover:text-brand-orange bg-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Gift size={14} />
            {isGifting ? "Đang xử lý..." : "Tặng người thân"}
          </button>
        </div>
      </div>

      {/* Banner Quảng cáo phụ bên dưới */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Ưu đãi thanh toán</span>
        <p className="text-xs font-bold leading-snug">Giảm thêm 5% khi thanh toán qua Ví điện tử / Thẻ Visa</p>
      </div>
    </div>
  );
};