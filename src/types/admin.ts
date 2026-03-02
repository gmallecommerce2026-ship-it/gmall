// src/types/admin.ts

// --- COMMON ---
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- USERS & SELLERS ---
export type UserRole = 'USER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'PENDING_SELLER';

export interface AdminUser {
  id: string;
  email?: string;
  username?: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isBanned: boolean;
  banReason?: string; 
  createdAt: string;
  shopName?: string; // Nếu là Seller
}

export interface CreateUserDto {
  name: string;
  username?: string;
  email?: string;
  password: string;
  role: UserRole;
  phone?: string;    // [Bổ sung] cho khớp form
  shopName?: string;
}

// --- SHOPS ---
export type ShopStatus = 'ACTIVE' | 'BANNED' | 'PENDING' | 'REJECTED';

export interface AdminShop {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  status: ShopStatus;
  rating: number;
  totalProducts: number;
  createdAt: string;
  owner: {
    fullName: string;
    email: string;
  };
}

// --- PRODUCTS ---
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'HIDDEN' | 'BANNED' | 'REJECTED' | 'PENDING_APPROVAL';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  thumbnail: string;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    shopName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// --- ORDERS ---
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';


export interface AdminOrder {
  id: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  recipientName?: string; 
  shop?: {
    id: string;
    name: string;
  };
  _count?: {
    items: number;
  };
}


export interface OrderResponse {
  data: AdminOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- FINANCE ---
export interface RevenueStats {
  today: number;
  thisMonth: number;
  total: number;
  growthRate: number; // % so với tháng trước
  chartData: { date: string; value: number }[];
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PayoutRequest {
  id: string;
  shopId: string;
  shopName: string;
  amount: number;
  bankInfo: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
}

// --- VOUCHERS ---
export interface AdminVoucher {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  value: number;
  minOrderValue: number;
  maxUsage: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export enum FlashSaleStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export interface FlashSaleSession {
  id: string;
  startTime: string; // ISO Date String
  endTime: string;   // ISO Date String
  status: FlashSaleStatus;
  timeStatus?: 'ONGOING' | 'UPCOMING' | 'ENDED'; // Virtual field từ BE
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashSaleDto {
  startTime: string;
  endTime: string;
  status?: boolean | FlashSaleStatus;
}