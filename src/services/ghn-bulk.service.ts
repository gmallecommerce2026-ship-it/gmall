// FE service cho 3 bulk shipping endpoint mới (wiki 0060).
// BE: /ghn/seller/bulk/{update-address,change-pickup-date,request-pickup}
import { api as apiClient } from './api';

export interface BulkResultItem {
  orderId: string;
  ok: boolean;
  message?: string;
  shippingOrderCode?: string;
}

export interface BulkResponse {
  successCount: number;
  failCount: number;
  results: BulkResultItem[];
}

export interface BulkUpdateAddressItem {
  orderId: string;
  recipientAddress: string;
  districtId: number;
  wardCode: string;
  provinceId?: number;
  recipientName?: string;
  recipientPhone?: string;
}

export const GhnBulkService = {
  updateAddress: (items: BulkUpdateAddressItem[]) =>
    apiClient.post<BulkResponse>('/ghn/seller/bulk/update-address', { items }),

  changePickupDate: (orderIds: string[], pickupDate: string) =>
    apiClient.post<BulkResponse>('/ghn/seller/bulk/change-pickup-date', { orderIds, pickupDate }),

  requestPickup: (orderIds: string[]) =>
    apiClient.post<BulkResponse>('/ghn/seller/bulk/request-pickup', { orderIds }),
};
