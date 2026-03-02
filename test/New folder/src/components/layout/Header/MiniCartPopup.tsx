// src/components/layout/Header/MiniCartPopup.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
// Xóa TrashBinIcon import nếu không dùng hoặc giữ nguyên nếu file icons/index.tsx có export
// import TrashBinIcon from "@/icons/trash.svg"; 

const MiniCartPopup = () => {
  const { items, removeItem, totalPrice, updateQuantity } = useCartStore();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="w-[420px] bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-base">Giỏ hàng của bạn <span className="text-gray-400 font-normal">({items.length})</span></h3>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
             <img src="/assets/empty-cart.png" alt="Empty" className="w-24 h-24 opacity-50" onError={(e) => e.currentTarget.style.display='none'}/>
             <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
             <Link href="/" className="px-4 py-2 bg-brand-orange text-white rounded text-sm hover:bg-orange-600 transition-colors">Mua sắm ngay</Link>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group relative">
              <Link href={`/product-details/${item.productId}`} className="w-16 h-16 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </Link>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                   <Link href={`/product-details/${item.productId}`} className="text-sm font-medium text-gray-800 line-clamp-1 hover:text-brand-orange transition-colors" title={item.title}>
                      {item.title}
                   </Link>
                   <span className="text-sm font-bold text-brand-orange flex-shrink-0">{formatCurrency(item.price)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                   <p className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {item.color || 'Màu mặc định'} - Size {item.size || 'F'}
                   </p>
                   
                   {/* Mini Quantity Control */}
                   <div className="flex items-center border border-gray-200 rounded overflow-hidden h-6 bg-white">
                      <button 
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 text-gray-600 font-bold"
                      >-</button>
                      <span className="text-xs font-medium px-2 min-w-[20px] text-center select-none">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
                      >+</button>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-red-500 shadow-sm"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 shadow-inner">
           <div className="flex justify-between items-end mb-3">
              <span className="text-sm text-gray-600">Tổng cộng:</span>
              <span className="text-lg font-bold text-brand-orange">{formatCurrency(totalPrice)}</span>
           </div>
           
           {/* Cập nhật phần nút bấm */}
           <div className="flex flex-col gap-3">
              <Link href="/cart" className="w-full flex items-center justify-center px-4 py-2 bg-white border border-brand-orange text-brand-orange rounded font-semibold text-sm hover:bg-orange-50 transition-colors">
                Xem giỏ hàng
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/payment" className="flex items-center justify-center px-4 py-2 bg-brand-orange text-white rounded font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md">
                  Đặt hàng
                </Link>
                
                <Link href="/gift-payment" className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded font-semibold text-sm hover:bg-pink-700 transition-colors shadow-md">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                   </svg>
                   Tặng quà
                </Link>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MiniCartPopup;