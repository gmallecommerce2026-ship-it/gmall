// wiki 0105 — API tiếp thị liên kết (affiliate SẢN PHẨM).
//
// KHÔNG nhầm với `/points/affiliate` — đó là hệ referral cũ (thưởng xu khi giới thiệu
// NGƯỜI), nằm ở tab "Giới thiệu bạn bè". Hai hệ chạy song song.
import { apiClient } from '@/lib/api/ApiClient';

export type AffiliateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'SETTLED' | 'CANCELLED' | 'REJECTED';

export interface AffiliateBalance {
  /** Đơn chưa giao xong — khách chưa nhận hàng. */
  waitingDelivery: number;
  /** Đã giao xong, chờ kỳ chốt sổ. Sàn đang giữ. */
  provisional: number;
  /** Đã chốt sổ, nằm trong ví, RÚT ĐƯỢC. */
  available: number;
  settledLifetime: number;
}

export interface AffiliateMe {
  registered: boolean;
  status: AffiliateStatus | null;
  code?: string;
  channel?: string | null;
  rejectReason?: string | null;
  totalClicks?: number;
  totalLinks?: number;
  totalOrders?: number;
  createdAt?: string;
  reviewedAt?: string | null;
  balance?: AffiliateBalance;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  salesCount: number;
  rating: number;
  affiliateRate: number;
  commissionPerUnit: number;
  shop: { id: string; name: string; slug: string } | null;
}

export interface AffiliateLink {
  id: string;
  code: string;
  clicks: number;
  path: string;
  createdAt?: string;
  orders?: number;
  earnedSettled?: number;
  earnedPending?: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    affiliateRate: number;
    affiliateEnabled?: boolean;
    estimatedCommission?: number;
  };
}

export interface AffiliateCommission {
  id: string;
  orderId: string;
  status: CommissionStatus;
  baseAmount: number;
  rate: number;
  amount: number;
  rejectReason: string | null;
  deliveredAt: string | null;
  createdAt: string;
  linkCode: string | null;
  product: { id: string; name: string; image: string | null };
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
};

// LƯU Ý: `apiClient` trả THẲNG body JSON (không bọc `.data` như axios) — xem
// ApiClient.request → res.json(). Viết `res.data` ở đây là lớp bug đã xảy ra ba lần
// trong dự án (wiki 0095 / 0099 / 0103), lần nào cũng ra toast lỗi giả.
export const AffiliateService = {
  getMe: () => apiClient.get<AffiliateMe>('/affiliate/me'),

  register: (body: { channel?: string; note?: string }) =>
    apiClient.post<{ status: AffiliateStatus; code: string }>('/affiliate/register', body),

  listProducts: (params: {
    search?: string;
    shopId?: string;
    sort?: string;
    page?: number;
  } = {}) => apiClient.get<Paged<AffiliateProduct>>(`/affiliate/products${qs(params)}`),

  listShops: () =>
    apiClient.get<{ id: string; name: string; slug: string; avatar: string | null; productCount: number }[]>(
      '/affiliate/shops',
    ),

  createLink: (productId: string) =>
    apiClient.post<AffiliateLink>('/affiliate/links', { productId }),

  listLinks: (page = 1) => apiClient.get<Paged<AffiliateLink>>(`/affiliate/links${qs({ page })}`),

  listCommissions: (params: { status?: string; page?: number } = {}) =>
    apiClient.get<Paged<AffiliateCommission>>(`/affiliate/commissions${qs(params)}`),

  listSettlements: () =>
    apiClient.get<{ id: string; period: string; amount: number; itemCount: number; settledAt: string }[]>(
      '/affiliate/settlements',
    ),

  listPayouts: () =>
    apiClient.get<{ id: string; amount: number; bankInfo: string; status: string; reason: string | null; requestedAt: string }[]>(
      '/affiliate/payouts',
    ),

  requestPayout: (body: { amount: number; bankInfo: string }) =>
    apiClient.post<{ success: boolean; id: string; amount: number }>('/affiliate/payout', body),

  /**
   * Ghi nhận lượt bấm link. Bắn đi KHÔNG CHỜ và nuốt mọi lỗi: đây là số liệu phụ, không
   * đáng để làm chậm hay làm hỏng trang sản phẩm mà người mua đang xem.
   */
  recordClick: (code: string) => {
    try {
      void apiClient.post('/affiliate/click', { code });
    } catch {
      /* bỏ qua */
    }
  },
};
