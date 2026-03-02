export interface Task {
  id: string;
  name: string;
  description: string;
  reward: number;
  status: 'PENDING' | 'COMPLETED';
  actionUrl?: string;
}

export interface TransferDto {
  receiverId: string;
  amount: number;
}

// Thêm interface cho History
export interface PointHistory {
  id: string;
  amount: number;
  type: 'EARN' | 'SPEND'; // Loại giao dịch: Nhận hoặc Tiêu
  description: string;
  createdAt: string;
  source?: string; // Nguồn: CHECKIN, ORDER, GAME...
}
export interface GachaResult {
  won: boolean;      // Trúng hay trượt
  reward: number;    // Số xu nhận được
  message: string;   // Thông báo
}

export interface CheckInState {
  isCheckedInToday: boolean;
  streak: number;       // Số ngày liên tục
  dayOfWeek: number;    // 1 (Thứ 2) -> 7 (CN) - Theo logic hiển thị của bạn
  points: number;       // Tổng điểm hiện tại
}