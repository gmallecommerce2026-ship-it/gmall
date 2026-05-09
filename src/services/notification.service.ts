import { api } from './api';

// #11/#23/#35/#53 (wiki 0044/0045) — wrapper cho /notifications endpoints.
// api.ts interceptor unwrap res.data → method trả thẳng <T>.

export interface NotificationItem {
  id: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'CHAT' | 'FRIEND';
  title: string;
  content: string;
  link?: string;
  image?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  meta: { page: number; pageSize: number; total: number; unread: number };
}

export const notificationService = {
  list: (page = 1, pageSize = 20) =>
    api.get<NotificationListResponse>(`/notifications?page=${page}&pageSize=${pageSize}`),

  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) => api.patch<NotificationItem>(`/notifications/${id}/read`, {}),

  markAllRead: () => api.patch<{ updated: number }>('/notifications/read-all', {}),
};
