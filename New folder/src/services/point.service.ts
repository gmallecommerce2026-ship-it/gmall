import { api } from './api';
import { Task, TransferDto, PointHistory, GachaResult } from '@/types/point';

export const pointService = {
  // Chuyển xu
  transferPoints: async (data: TransferDto) => {
    const response = await api.post('/points/transfer', data);
    return response.data;
  },

  // Lấy danh sách nhiệm vụ
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/points/tasks');
    return response.data;
  },
  
  // Lấy thông tin tổng quan (Số dư, streak...)
  getMyPoints: async () => {
    const response = await api.get('/points/me');
    return response.data;
  },

  // Lấy lịch sử giao dịch
  getHistory: async (): Promise<PointHistory[]> => {
    const response = await api.get('/points/history');
    return response.data;
  },

  checkIn: async () => {
    const response = await api.post('/points/check-in');
    return response.data; // Trả về { reward: 100, streak: ... }
  },

  // Quay thưởng Gacha
  playGacha: async (): Promise<GachaResult> => {
    const response = await api.post('/games/gacha/spin');
    return response.data;
  }
};