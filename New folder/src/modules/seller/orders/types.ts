// src/modules/seller/orders/types.ts

// Thêm 'bulk-delivery' | 'handover' | 'return' vào type để khớp với logic trang
export type OrderTabStatus = 'all' | 'bulk-delivery' | 'handover' | 'return' | 'return_refund' | 'cancelled' | 'delivery_failed';

export interface MainTab {
  id: OrderTabStatus;
  label: string;
  count?: number; 
  isActive: boolean;
}

export interface SubFilter {
  id: string;
  label: string;
  count?: number;
  isActive: boolean;
}

export interface PriorityFilter {
  id: string;
  label: string;
  type: 'priority' | 'action';
  isActive: boolean;
}

export interface TableColumn {
  id: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}