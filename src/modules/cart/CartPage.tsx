// src/modules/cart/CartPage.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CartList from "@/modules/cart/components/CartList";
import CheckoutSummary from "@/modules/cart/components/CheckoutSummary";
import { useCartActions, useCartData } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";

const CartPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  
  // 1. Lấy dữ liệu từ Store (Dữ liệu thật)
  const { items, selectedIds, isLoading } = useCartData();
  const { 
    fetchCart, 
    updateQuantity, 
    removeItem, 
    toggleItemSelection, 
    toggleAllSelection, 
    toggleShopSelection // Hàm này chỉ nhận (ids, checked)
  } = useCartActions();

  // 2. Fetch dữ liệu khi vào trang
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 3. [DEBUG & FIX] Hàm wrapper để xử lý sự kiện toggle shop
  const handleToggleShop = (shopId: string, itemIds: string[], checked: boolean) => {
    // Đặt debug log tại đây để kiểm tra dữ liệu
    console.log(`[DEBUG] Toggle Shop:`, {
      shopId,
      itemsCount: itemIds.length,
      checked
    });

    // Gọi hàm của Store (Bỏ qua tham số shopId vì Store không cần)
    toggleShopSelection(itemIds, checked);
  };

  const handleCheckoutNavigation = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      return router.push("/login");
    }
    
    if (selectedIds.length === 0) {
      return toast.error("Vui lòng chọn sản phẩm để mua!");
    }

    router.push("/payment");
  };

  const handleGiftNavigation = () => {
      if (selectedIds.length === 0) return toast.error("Vui lòng chọn sản phẩm!");
      router.push("/gift-payment");
  };

  if (isLoading && items.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center w-full bg-[#F5F5FA] min-h-screen">
      <Toaster position="top-center" />
      <div className="w-full max-w-[1240px] mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: "Trang chủ", href: "/" }, { name: "Giỏ hàng", href: "/cart" }]} />

        <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-6">Giỏ hàng của bạn</h1>

        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cột trái: Danh sách sản phẩm */}
            <div className="flex-1 min-w-0">
              <CartList
                items={items}
                selectedIds={selectedIds}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
                onToggleItem={toggleItemSelection}
                onToggleAll={toggleAllSelection}
                // Sử dụng hàm wrapper thay vì truyền trực tiếp
                onToggleShop={handleToggleShop} 
              />
            </div>
            
            {/* Cột phải: Tổng tiền & Nút mua */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <CheckoutSummary
                onBuyNow={handleCheckoutNavigation}
                onGiftNow={handleGiftNavigation}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
            <img src="/assets/empty-cart.png" alt="Empty Cart" className="w-48 h-48 object-contain opacity-80 mb-4" onError={(e) => e.currentTarget.style.display='none'}/>
            <p className="text-gray-500 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
            <button 
                onClick={() => router.push('/')}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
                Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;