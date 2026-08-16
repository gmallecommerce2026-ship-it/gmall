// wiki 0105 — API tiếp thị liên kết (affiliate SẢN PHẨM).
//
// KHÔNG nhầm với `/points/affiliate` — đó là hệ referral cũ (thưởng xu khi giới thiệu
// NGƯỜI), nằm ở tab "Giới thiệu bạn bè". Hai hệ chạy song song.
import { apiClient } from '@/lib/api/ApiClient';

export type AffiliateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface AffiliateMe {
  registered: boolean;
  status: AffiliateStatus | null;
  code?: string;
  channel?: string | null;
  rejectReason?: string | null;
  totalClicks?: number;
  totalOrders?: number;
  createdAt?: string;
  reviewedAt?: string | null;
}

export interface AffiliateRegisterResult {
  status: AffiliateStatus;
  code: string;
}

// LƯU Ý: `apiClient` trả THẲNG body JSON (không bọc `.data` như axios) — xem
// ApiClient.request → res.json(). Viết `res.data` ở đây là lớp bug đã xảy ra ba lần
// trong dự án (wiki 0095 / 0099 / 0103), lần nào cũng ra toast lỗi giả.
export const AffiliateService = {
  getMe: () => apiClient.get<AffiliateMe>('/affiliate/me'),

  register: (body: { channel?: string; note?: string }) =>
    apiClient.post<AffiliateRegisterResult>('/affiliate/register', body),
};
