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
  // [round15 L2 FIX] GHN address keys — BE persists order.provinceId/districtId/wardCode
  // từ receiverInfo (bulkRequestPickup đọc districtId/wardCode). Phải mang theo từ IAddress.
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
}

// TS-fix wiki 0031: thêm `selectedShopVoucher` (single-cart legacy) + `setSelectedVoucher`
// để các UI cũ (VoucherSelector, useCartCalculation, GiftPaymentPage) compile.
// Multi-shop voucher map (shopVouchers) vẫn là source-of-truth chính.
interface CheckoutState {
  // --- Data ---
  buyerInfo: UserInfo;
  senderInfo: UserInfo;
  receiverInfo: UserInfo;

  // [UPDATED] Quản lý theo Shop ID (Multi-shop support)
  shopVouchers: Record<string, Voucher | null>;
  shopShipping: Record<string, ShippingSelection | null>;
  shopMessages: Record<string, string>;

  // [LEGACY-COMPAT] Single voucher dùng cho UI gộp giỏ
  selectedShopVoucher: Voucher | null;

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

  // Overload: nếu chỉ truyền 1 arg => set vào legacy single slot.
  setShopVoucher: (shopIdOrVoucher: string | Voucher | null, voucher?: Voucher | null) => void;
  setShopShipping: (shopId: string, shipping: ShippingSelection | null) => void;
  setShopMessage: (shopId: string, message: string) => void;

  setSystemVoucher: (voucher: Voucher | null) => void;
  setSelectedVoucher: (voucherId: string | null) => void;
  setAppliedCoins: (coins: number) => void;
  resetCheckout: () => void;

  // --- [NEW] ACTIONS ---
  setBuyNowItem: (item: CartItem) => void; // Gọi khi ấn "Mua Ngay" ở trang chi tiết
  clearCheckoutSession: () => void;        // Xóa session mua ngay
  // [round15 FIX buynow-hijack] Gọi khi bắt đầu checkout TỪ GIỎ để 1 phiên Mua-Ngay
  // bị bỏ dở không chiếm quyền (isBuyNowFlow stale=true) trang /payment.
  startCartCheckout: () => void;
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

      selectedShopVoucher: null,
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

      // TS-fix wiki 0031: Hỗ trợ 1-arg (single voucher) hoặc 2-arg (multi-shop)
      setShopVoucher: (shopIdOrVoucher, voucher) => {
        if (typeof shopIdOrVoucher === 'string') {
          const sid = shopIdOrVoucher;
          const v = voucher ?? null;
          set((state) => ({
            shopVouchers: { ...state.shopVouchers, [sid]: v },
            // sync legacy slot (giữ giá trị mới nhất để UI cũ hiển thị)
            selectedShopVoucher: v,
          }));
        } else {
          // 1-arg form: voucher | null cho UI cũ chỉ có 1 voucher
          const v = (shopIdOrVoucher as Voucher | null) ?? null;
          set({ selectedShopVoucher: v });
        }
      },
      
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
      setSelectedVoucher: (voucherId) => set({ selectedVoucherId: voucherId }),
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

      // [round15 FIX buynow-hijack] Bắt đầu checkout từ giỏ: tắt cờ Mua-Ngay +
      // xoá item Mua-Ngay tạm để PaymentPage dùng đúng các item giỏ đã chọn.
      startCartCheckout: () => set({
        isBuyNowFlow: false,
        checkoutItems: [],
      }),
      
      // Reset toàn bộ
      resetCheckout: () => set({
        shopVouchers: {},
        shopShipping: {},
        shopMessages: {},
        selectedShopVoucher: null,
        selectedSystemVoucher: null,
        selectedVoucherId: null,
        // Reset luôn cả state mua ngay
        isBuyNowFlow: false,
        checkoutItems: [],
        appliedCoins: 0
      }),
    }),
    {
      name: 'gmall-checkout-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, 
    }
  )
);