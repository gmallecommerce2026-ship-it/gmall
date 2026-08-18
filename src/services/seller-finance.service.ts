// wiki 0108: dịch vụ ví & rút tiền cho người bán.
//
// Backend đã có đủ ba endpoint từ lâu và chạy đúng (đã đo trên prod: số dư khớp DB,
// escrow trừ tiền nguyên tử, rút vượt số dư bị chặn, thiếu thông tin ngân hàng bị chặn).
// Thứ thiếu là phía giao diện: `/seller/finance` trả 404, không màn hình nào gọi tới,
// nên **người bán không có bất kỳ đường nào để rút tiền của mình ra**.
import { apiClient } from '@/lib/api/ApiClient';

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;

export interface PayoutRequest {
  id: string;
  amount: number;
  bankInfo: string;
  status: PayoutStatus;
  reason?: string | null;
  requestedAt: string;
  processedAt?: string | null;
}

export const SellerFinanceService = {
  // GET /seller/finance/wallet -> { walletBalance: number }
  getWallet: async (): Promise<{ walletBalance: number }> => {
    const res: any = await apiClient.get('/seller/finance/wallet');
    return { walletBalance: Number(res?.walletBalance ?? 0) };
  },

  // GET /seller/finance/payouts -> PayoutRequest[]
  getPayouts: async (): Promise<PayoutRequest[]> => {
    const res: any = await apiClient.get('/seller/finance/payouts');
    // `ApiClient` trả null khi 401/không-JSON — chuẩn hoá về mảng để chỗ gọi luôn .map() được.
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    return Array.isArray(list) ? list : [];
  },

  // POST /seller/finance/payout { amount, bankInfo }
  requestPayout: async (amount: number, bankInfo: string) => {
    return apiClient.post('/seller/finance/payout', { amount, bankInfo });
  },
};
