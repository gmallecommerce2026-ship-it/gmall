// src/services/ReviewService.ts
import { apiClient } from '@/lib/api/ApiClient';

export interface SubmitOrderReviewPayload {
  orderId: string;
  shopRating: number;
  shopComment?: string;
  productReviews: Array<{
    productId: string;
    rating: number;
    comment?: string;
  }>;
}

export const ReviewService = {
  getToReview: () => apiClient.get('/reviews/pending'),
  getMyReviews: () => apiClient.get('/reviews/me'),

  // Submit review cho cả order (1 shop rating + N product ratings).
  // BE endpoint: POST /orders/review (xem review.controller + order.controller).
  submitOrderReview: (data: SubmitOrderReviewPayload) =>
    apiClient.post('/orders/review', data),
};
