// src/services/socket.ts
import { io } from 'socket.io-client';
// Fix BUG-FE-10 (wiki 0030): centralized config (throws in prod if env missing)
import { API_BASE_URL } from '@/lib/api/config';

const SOCKET_URL = API_BASE_URL;

const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Bắt buộc dùng websocket để giảm độ trễ
  autoConnect: false,        // Không tự kết nối ngay, đợi Component gọi connect()
  reconnection: true,        // Tự động kết nối lại nếu mất mạng
  reconnectionAttempts: 5,   // Thử lại tối đa 5 lần
  reconnectionDelay: 1000,
});

export default socket;