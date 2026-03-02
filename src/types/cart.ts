// src/types/cart.ts
export interface CartItem {
  id: string;
  productId: string | number;
  productVariantId?: string | number;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  stock: number;
  
  // Thêm các trường này
  shopId: string;
  shopName: string;
  
  // Các field tùy chọn khác
  color?: string;
  size?: string;
  variantName?: string;
}

export interface CartGroup {
  shopId: string;
  shopName: string;
  items: CartItem[];
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}