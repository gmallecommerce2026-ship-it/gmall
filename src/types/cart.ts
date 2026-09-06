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
  // wiki 0108: `/store/cart` nay trả kèm mã SKU của biến thể, dùng làm phương án dự phòng
  // khi không dựng được tên phân loại từ dữ liệu (tierIndex trên prod không nhất quán).
  sku?: string | null;
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