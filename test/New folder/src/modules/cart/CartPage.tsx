// src/modules/cart/CartPage.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CartList from "@/modules/cart/components/CartList";
import CheckoutSummary from "@/modules/cart/components/CheckoutSummary";
// IMPORT SELECTORS MỚI
import { useCartItems, useCartSummary, useCartActions } from "@/store/useCartStore";

const CartPage = () => {
  const router = useRouter();

  // 1. Dữ liệu Items: Chỉ re-render khi mảng items thay đổi (shallow check)
  const items = useCartItems();

  // 2. Dữ liệu Tổng kết: Chỉ re-render khi giá/số lượng tổng thay đổi
  const { totalPrice, isLoading } = useCartSummary();

  // 3. Actions: Không bao giờ gây re-render
  const { fetchCart, updateQuantity, removeItem } = useCartActions();

  useEffect(() => {
    fetchCart();
  }, []); // Actions ổn định, không cần dependency array phức tạp

  const handleCheckoutNavigation = () => {
    if (items.length === 0) return;
    router.push('/payment');
  };

  // Chỉ hiển thị loading skeleton lần đầu tiên (khi chưa có item nào)
  if (isLoading && items.length === 0) {
    return <div className="flex justify-center p-20">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <div className="w-full max-w-[1340px] mx-auto px-4 py-8">
        <Breadcrumbs items={[{ name: "Trang chủ", href: "/" }, { name: "Giỏ hàng", href: "/cart" }]} />

        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <div className="flex-1 min-w-0">
              <CartList
                items={items}
                onQuantityChange={updateQuantity} // Action trực tiếp, UI update ngay lập tức
                onRemove={removeItem}             // Action trực tiếp
              />
            </div>
            
            <div className="w-full lg:w-[391px] flex-shrink-0">
              <CheckoutSummary
                subtotal={totalPrice}
                discount={0} 
                total={totalPrice}
                onBuyNow={handleCheckoutNavigation}
                onGiftNow={() => router.push('/gift-payment')}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <img src="/assets/empty-cart.png" alt="Empty" className="w-40 h-40 opacity-50"/>
             <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
             <button onClick={() => router.push('/')} className="text-brand-orange hover:underline">Mua sắm ngay</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;