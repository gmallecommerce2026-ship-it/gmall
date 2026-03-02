// src/modules/seller/shipping/types.ts
export interface ShippingService {
  id: string;
  name: string;
  isEnabled: boolean;
  isCodEnabled?: boolean;
}

export interface ShippingChannel {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  services: ShippingService[]; // Các dịch vụ con (VD: Hỏa tốc 2h, 4h)
}

export type SettingsTabId = 'address' | 'shipping_unit' | 'documents';