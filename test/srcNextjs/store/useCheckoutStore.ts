import { Voucher } from '@/services/voucher.service';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/cart'; // Đảm bảo bạn đã có type này

// 1. Định nghĩa kiểu dữ liệu vận chuyển cho từng shop
export interface ShippingSelection {
  deliveryMethodId: string; // VD: 'ghn', 'express'
  fee: number;
  leadTime?: number;
  name?: string; // Tên đơn vị vận chuyển (để hiển thị UI nếu cần)
}

export interface UserInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  relation?: string; 
  message?: string;  
}

interface CheckoutState {
  // --- Data ---
  buyerInfo: UserInfo;
  senderInfo: UserInfo;
  receiverInfo: UserInfo;

  // [UPDATED] Quản lý theo Shop ID (Multi-shop support)
  shopVouchers: Record<string, Voucher | null>; 
  shopShipping: Record<string, ShippingSelection | null>;
  shopMessages: Record<string, string>; 

  // Global
  selectedSystemVoucher: Voucher | null;
  selectedVoucherId: string | null;
  appliedCoins: number;
  // --- [NEW] STATE CHO MUA NGAY ---
  isBuyNowFlow: boolean;      // Cờ đánh dấu: true = đang mua ngay, false = mua từ giỏ
  checkoutItems: CartItem[];  // Lưu sản phẩm mua ngay tạm thời (không lưu vào DB giỏ hàng)

  // --- Actions ---
  // setApplyCoins: (coins: any) => void;
  setBuyerInfo: (info: UserInfo) => void;
  setSenderInfo: (info: UserInfo) => void;
  setReceiverInfo: (info: UserInfo) => void;
  
  setShopVoucher: (shopId: string, voucher: Voucher | null) => void;
  setShopShipping: (shopId: string, shipping: ShippingSelection | null) => void;
  setShopMessage: (shopId: string, message: string) => void;
  
  setSystemVoucher: (voucher: Voucher | null) => void;
  setAppliedCoins: (coins: number) => void;
  resetCheckout: () => void;

  // --- [NEW] ACTIONS ---
  setBuyNowItem: (item: CartItem) => void; // Gọi khi ấn "Mua Ngay" ở trang chi tiết
  clearCheckoutSession: () => void;        // Xóa session mua ngay
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      // --- Giá trị mặc định ---
      buyerInfo: {
        name: "",
        phone: "",
        address: "",
      },
      senderInfo: {
        name: "", 
        relation: "",
        phone: "",
        address: "",
      },
      receiverInfo: {
        name: "", 
        relation: "",
        phone: "",
        email: "",
        address: "",
        message: "",
      },
      
      shopVouchers: {},
      shopShipping: {},
      shopMessages: {},
      
      selectedSystemVoucher: null,
      selectedVoucherId: null,
      appliedCoins: 0,
      // [NEW] Init
      isBuyNowFlow: false,
      checkoutItems: [],

      // --- Implement Actions ---
      setBuyerInfo: (info) => set({ buyerInfo: info }),
      setSenderInfo: (info) => set({ senderInfo: info }),
      setReceiverInfo: (info) => set({ receiverInfo: info }),

      setShopVoucher: (shopId, voucher) => 
        set((state) => ({ 
          shopVouchers: { 
            ...state.shopVouchers, 
            [shopId]: voucher 
          } 
        })),
      
      setShopShipping: (shopId, shipping) => 
        set((state) => ({ 
          shopShipping: { 
            ...state.shopShipping, 
            [shopId]: shipping 
          } 
        })),

      setShopMessage: (shopId, message) =>
        set((state) => ({ 
          shopMessages: { 
            ...state.shopMessages, 
            [shopId]: message 
          } 
        })),

      setSystemVoucher: (voucher) => set({ selectedSystemVoucher: voucher }),
      setAppliedCoins: (coins) => set({ appliedCoins: coins }),
      // [NEW] Action set item mua ngay
      setBuyNowItem: (item) => set({
        isBuyNowFlow: true,
        checkoutItems: [item]
      }),

      // [NEW] Action clear session
      clearCheckoutSession: () => set({
        isBuyNowFlow: false,
        checkoutItems: [],
        appliedCoins: 0 // Reset xu
      }),
      
      // Reset toàn bộ
      resetCheckout: () => set({ 
        shopVouchers: {}, 
        shopShipping: {}, 
        shopMessages: {},
        selectedSystemVoucher: null,
        selectedVoucherId: null,
        // Reset luôn cả state mua ngay
        isBuyNowFlow: false,
        checkoutItems: [],
        appliedCoins: 0
      }),
    }),
    {
      name: 'lovegifts-checkout-storage', 
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, 
    }
  )
);