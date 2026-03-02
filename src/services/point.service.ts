import { api } from './api';
import { Task, TransferDto, PointHistory, GachaResult } from '@/types/point';

export const pointService = {
  // Chuyển xu
  transferPoints: async (data: TransferDto) => {
    const response = await api.post('/points/transfer', data);
    return response; // [ĐÃ SỬA]: Bỏ .data
  },

  // Lấy danh sách nhiệm vụ
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/points/tasks');
    return response as unknown as Task[]; // [ĐÃ SỬA]: Bỏ .data
  },
  
  // Lấy thông tin tổng quan
  getMyPoints: async () => {
    const response = await api.get('/points/me');
    return response; // [ĐÃ SỬA]: Bỏ .data
  },

  // Lấy lịch sử giao dịch
  getHistory: async (): Promise<PointHistory[]> => {
    const response = await api.get('/points/history');
    return response as unknown as PointHistory[]; // [ĐÃ SỬA]: Bỏ .data
  },

  checkIn: async () => {
    const response = await api.post('/events/daily-checkin');
    return response; // [ĐÃ SỬA]: Bỏ .data
  },

  playGacha: async () => {
    const response = await api.post('/games/gacha/spin');
    return response; // [ĐÃ SỬA]: Bỏ .data
  },

  // [QUAN TRỌNG] Hàm gây lỗi của bạn
  getDailyStatus: async () => {
    const response = await api.get('/events/status'); 
    // Lúc này response chính là object { isCheckedInToday: ..., hasSpunToday: ... }
    return response; // [ĐÃ SỬA]: Bỏ .data
  },

  resetDaily: async () => {
    const response = await api.post('/events/reset-test'); 
    return response;
  },

  initiateTransfer: async (receiverId: string, amount: number) => {
    const response = await api.post('/points/transfer/init', { receiverId, amount });
    return response;
  },

  confirmTransfer: async (otp: string) => {
    const response = await api.post('/points/transfer/confirm', { otp });
    return response;
  }
};