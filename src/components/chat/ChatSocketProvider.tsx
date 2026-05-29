'use client';
// Wiki 0067: Tách socket lifecycle khỏi ChatWindow.
// Trước: ChatWindow `if (!isOpen) return null` → useEffect connectSocket KHÔNG chạy
// khi chat popup đóng → seller (hoặc buyer) không nhận tin nhắn realtime cho tới
// khi click mở chat. Brief: "chưa đồng bộ tin nhắn khi chat với seller".
//
// Sau: provider headless luôn mounted, quản lý socket connect/reconnect/load
// conversations. ChatWindow chỉ lo UI.
import { useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';

export default function ChatSocketProvider() {
  const socket = useChatStore(s => s.socket);
  const connectSocket = useChatStore(s => s.connectSocket);
  const disconnectSocket = useChatStore(s => s.disconnectSocket);
  const loadConversations = useChatStore(s => s.loadConversations);
  const user = useUserStore(s => s.user);

  // Initial connect — chạy 1 lần khi component mount lần đầu.
  useEffect(() => {
    if (!socket) {
      connectSocket(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconnect khi user login/logout — đổi identity socket.
  useEffect(() => {
    if (user?.id) {
      disconnectSocket();
      const t = setTimeout(() => connectSocket(null), 100);
      return () => clearTimeout(t);
    }
  }, [user?.id, connectSocket, disconnectSocket]);

  // Load conversations khi user login.
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id, loadConversations]);

  return null;
}
