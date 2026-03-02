// src/services/socket.ts
import { io } from 'socket.io-client';

// URL này phải trỏ về Backend NestJS của bạn.
// Nếu chạy local thường là http://localhost:3001 hoặc http://localhost:3000
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Bắt buộc dùng websocket để giảm độ trễ
  autoConnect: false,        // Không tự kết nối ngay, đợi Component gọi connect()
  reconnection: true,        // Tự động kết nối lại nếu mất mạng
  reconnectionAttempts: 5,   // Thử lại tối đa 5 lần
  reconnectionDelay: 1000,
});

export default socket;