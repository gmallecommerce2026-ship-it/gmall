import { OrderStatus } from '@/types/admin';
import { api } from './api';
import { affiliateRefsFor, forgetAffiliates } from '@/lib/affiliate/attribution'; // wiki 0105

// ==========================================
// 1. DTOs CHO TÍNH NĂNG CHECKOUT & PREVIEW
// ==========================================

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ReceiverInfo {
  name: string;
  phone: string;
  address: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
}

export interface SenderInfo {
  name: string;
  message?: string;
  hideInfo?: boolean;
}

export interface CreateOrderPayload {
  isBuyNow: boolean;
  items: OrderItemInput[];
  voucherIds?: string[]; // Mảng chứa ID các voucher (cả voucher sàn và voucher shop)
  receiverInfo: ReceiverInfo;
  senderInfo?: SenderInfo; // Thông tin người gửi (nếu là tặng quà)
  giftWrapIndex?: number;  // Index của gói quà (nếu có)
  cardIndex?: number;      // Index của thiệp (nếu có)
  note?: string | Record<string, string>; // Ghi chú: String chung hoặc Object { 'shopId': 'note' }
  paymentMethod: 'cod'; // [wiki 0093] TẮT momo+pay2s → chỉ 'cod' (BE whitelist @IsIn(['cod'])). [wiki 0091] đã bỏ 'banking'.
  useCoins?: boolean; 
  appliedCoins?: number; // Số xu muốn áp dụng
  // wiki 0105 — quy đổi affiliate, tự gắn trong `createOrder` từ cookie `gm_aff`.
  // Không cần chỗ gọi tự truyền: quên truyền = mất trắng hoa hồng của người đã dẫn
  // khách tới, mà đó là loại lỗi không ai phát hiện được vì chẳng có gì báo sai.
  affiliate?: { productId: string; code: string }[];
}

// [round15 FIX preview-shape] BE /orders/preview trả về cấu trúc LỒNG NHAU
// { breakdown, summary: { ..., discounts: {...}, total }, appliedVouchers }
// (xem G-Mall-BE order.service.ts previewOrder). Interface phẳng cũ
// (totalAmount/discountAmount/finalAmount/coinDiscount) KHÔNG tồn tại trên wire →
// mọi field đọc ra undefined. Khai báo lại đúng shape để FE dùng làm source-of-truth.
export interface PreviewOrderResponse {
  summary: {
    subtotal: number;        // Tổng tiền hàng chưa giảm
    shippingFee: number;     // Tổng phí ship
    giftFee: number;         // Phí gói quà/thiệp (nếu có)
    discounts: {
      shopVoucher: number;   // Tổng giảm voucher shop (đã quy ra VND, kể cả PERCENTAGE)
      systemVoucher: number; // Giảm voucher sàn (VND)
      freeship: number;      // Giảm phí ship (VND, cap ≤ tổng ship)
      coin: number;          // Xu đã áp dụng (đã cap min(balance,50000,payable))
    };
    total: number;           // Số tiền khách thực trả cuối cùng (authoritative)
  };
  breakdown: {               // Chi tiết từng shop (cho Multi-shop checkout)
    shopId: string;
    shopName: string;
    items: any[];
    shippingFee: number;
    shopDiscount: number;
    totalBeforeSystem: number;
    [key: string]: any;
  }[];
  appliedVouchers: {         // Danh sách voucher hợp lệ đã áp dụng
    id: string;
    code: string;
    discount: number;
    type: string;
    [key: string]: any;
  }[];
}

export interface CreateOrderResponse {
  orders: IOrder[];    // Danh sách các đơn hàng con đã tạo
  paymentUrl?: string; // Link thanh toán (nếu chọn phương thức online)
}

// ==========================================
// 2. INTERFACES CŨ (GIỮ NGUYÊN)
// ==========================================

export interface IOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  // wiki 0108: chú thích cũ ("Backend hiện tại chưa trả về") ĐÃ SAI. `getUserOrders`
  // include sẵn `shop: { id, name, avatar }` từ lâu — chỉ là giao diện đọc `shopName`
  // phẳng nên không thấy, rồi rơi vào fallback và hiện "G-Mall Official" cho MỌI đơn,
  // kể cả đơn mua của shop khác. Giữ `shopName` cho tương thích, thêm `shop` đúng hình dạng.
  shopName?: string;
  shop?: { id?: string; name?: string; avatar?: string | null };
  shopId?: string;
  isGift?: boolean;
  giftMessage?: string | null;
  isReviewed?: boolean;
  items: Array<{
    id: string;
    productId?: string;
    quantity: number;
    price: number;
    product: {
      id: string; 
      name: string;
      slug: string;
      images: string[] | string;
    };
  }>;
}
export interface IOrderActionResponse {
  success: boolean;
  message?: string;
  earnedPoints?: number; // Có thể có hoặc không
  newBalance?: number;   // Có thể có hoặc không
}
// Định nghĩa Interface dựa trên Prisma Schema và response từ Backend
export interface IOrderDetail {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number; // Decimal trả về dạng string hoặc number tùy config, FE nên handle cả 2
  shippingFee: number;
  // Thông tin người nhận
  recipientName: string | null;
  recipientPhone: string | null;
  recipientAddress: string | null;
  
  paymentMethod: string;
  shippingProvider: string;
  shippingOrderCode: string | null;

  isReviewed?: boolean;
  
  createdAt: string;
  
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[] | string;
    };
  }>;
}

// ==========================================
// 3. SERVICE METHODS
// ==========================================

export const OrderService = {
  // --- [NEW] CÁC HÀM CHO CHECKOUT ---

  /**
   * Tính toán trước đơn hàng: Phí ship, Giảm giá, Tổng tiền
   * Gọi khi user tích chọn sản phẩm hoặc thay đổi địa chỉ/voucher
   */
  previewOrder: async (payload: CreateOrderPayload): Promise<PreviewOrderResponse> => {
    return api.post('/orders/preview', payload);
  },

  /**
   * Tạo đơn hàng chính thức
   * Gọi khi user bấm nút "Đặt hàng"
   */
  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    // wiki 0105 — gắn quy đổi affiliate NGAY TẠI ĐÂY thay vì bắt từng màn checkout tự
    // nhớ. Cookie `gm_aff` được ghi lúc người mua bấm link `?aff=`; ở đây chỉ lọc lấy
    // đúng những sản phẩm có trong đơn. BE kiểm lại toàn bộ nên dữ liệu này không cần
    // tin cậy, chỉ cần có mặt.
    const productIds = (payload.items ?? []).map((i) => i.productId).filter(Boolean);
    const affiliate = affiliateRefsFor(productIds);
    const res = await api.post('/orders', affiliate.length ? { ...payload, affiliate } : payload);

    // Đặt xong thì quên quy đổi của những SP đã mua — nếu giữ lại, đơn SAU của cùng
    // sản phẩm vẫn bị gán cho người tiếp thị cũ dù khách tự quay lại mua.
    if (affiliate.length) forgetAffiliates(affiliate.map((a) => a.productId));
    return res as CreateOrderResponse;
  },

  // --- [EXISTING] CÁC HÀM CŨ GIỮ NGUYÊN ---

  getMyOrders: async (status?: string): Promise<IOrder[]> => {
    const params: any = {};
    if (status && status !== 'all') {
      params.status = status;
    }
    return api.get('/orders', { params });
  },

  getOrderDetail: async (orderId: string): Promise<IOrderDetail> => {
    return api.get(`/orders/${orderId}`);
  },

  getSellerOrders: async (status?: string) => {
    const paramStatus = (status === 'all') ? undefined : status;
    return api.get('/orders/seller', { params: { status: paramStatus } });
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return api.patch(`/orders/${orderId}/status`, { status });
  },

  cancelOrder: async (orderId: string) => {
    return api.patch(`/orders/${orderId}/cancel`);
  },

  getSellerOrderDetail: async (orderId: string) => {
    return api.get(`/orders/seller/${orderId}`);
  },

  submitReview: async (data: {
    orderId: string;
    shopRating: number;
    shopComment?: string;
    productReviews: Array<{ productId: string; rating: number; comment?: string }>;
  }) => {
    return api.post('/orders/review', data);
  },

  confirmReceived: async (orderId: string) => {
    return await api.post<IOrderActionResponse>(`/orders/${orderId}/confirm`);
  },
};