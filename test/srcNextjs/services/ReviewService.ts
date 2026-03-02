// src/services/ReviewService.ts
import { apiClient } from '@/lib/api/ApiClient';

export const ReviewService = {
  // Lấy danh sách sản phẩm cần đánh giá (thường là từ các đơn hàng đã giao)
  getToReview: () => apiClient.get('/reviews/pending'),
  
  // Lấy lịch sử đánh giá của tôi
  getMyReviews: () => apiClient.get('/reviews/me'),
  
  // Tạo đánh giá mới
  create: (data: { productId: string; orderId: string; rating: number; comment: string }) => 
    apiClient.post('/reviews', data),
};