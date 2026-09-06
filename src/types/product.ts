// src/types/product.ts

// 1. Định nghĩa Tier (Nhóm phân loại) - Ví dụ: Màu sắc, Kích thước
export interface ProductTier {
  name: string;        // Tên nhóm (VD: "Màu sắc")
  options: string[];   // Các tùy chọn (VD: ["Đỏ", "Xanh"])
  images?: string[];   // Ảnh đại diện cho từng option (thường dùng cho nhóm 1)
}

// 2. Định nghĩa Variant (Biến thể SKU) - Ví dụ: Màu Đỏ - Size S
export interface ProductVariant {
  id?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku?: string;
  image?: string | null;
  imageUrl?: string;
  tierIndex: number[] | string;
  discountValue?: number;
}

// 3. Interface Product đầy đủ
export interface Product {
  /** wiki 0105 — affiliate sản phẩm: seller đã bật tiếp thị liên kết cho SP này chưa. */
  affiliateEnabled?: boolean;
  /** Tỉ lệ hoa hồng dạng thập phân (0.05 = 5%). Null khi chưa đặt. */
  affiliateRate?: number | null;

  id: string;
  title: string;          // Tên sản phẩm
  slug: string;
  description?: string;   // Mô tả HTML hoặc text
  shortDesc?: {
    brand?: string;
    features?: string;
    benefits?: string;
    recipient?: string;
    occasion?: string;
    note?: string;
  };


  // --- Giá & Kho (Hiển thị mặc định khi chưa chọn phân loại) ---
  price: number;          // Giá bán hiện tại (hoặc giá thấp nhất)
  regularPrice?: number;  // Giá niêm yết (nếu có giảm giá)

  // --- NEW: Direct Discount System ---
  originalPrice?: number; // Giá gốc trước khi giảm (Field mới)
  discountType?: 'PERCENT';
  discountValue?: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  isDiscountActive?: boolean;
  discountPercent?: number; // % giảm giá (VD: 10, 20)
  stockTotal?: number;     // Tổng tồn kho của tất cả biến thể
  stock?: number;          // Alias cho stockTotal (tùy backend trả về field nào)

  // --- Hình ảnh & Media ---
  imageUrl: string;       // Ảnh đại diện chính (Thumbnail)
  images?: string[];      // Danh sách ảnh gallery
  videos?: string[];      // Danh sách video
  options?: any;
  // --- Thông tin SEO / Chi tiết ---
  brand?: string;
  origin?: string;
  attributes?: Record<string, any>; // Các thuộc tính JSON khác (Chất liệu,...)
  categoryId?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'ACTIVE' | 'BANNED';
  category?: { name: string; slug: string };
  // --- Thông tin người bán ---
  sellerId?: string;      // ID người bán
  shopId?: string;        // Alias cho sellerId (tùy backend trả về)
  shopName?: string;
  shopAvatar?: string;
  rejectReason?: string | null;
  // --- Phân loại hàng (Dynamic Tiers) ---
  tiers?: ProductTier[];       // Mảng các nhóm phân loại (Màu, Size...)
  variants?: ProductVariant[];
  // variations?: ProductVariant[]; // Danh sách các biến thể SKU

  // --- Thống kê ---
  rating?: number;        // Đánh giá trung bình (VD: 4.5)
  reviewCount?: number;   // Số lượng đánh giá
  salesCount?: number;    // Số lượng đã bán (VD: 1200)

  // --- Vận chuyển (Optional - nếu cần tính phí ship bên client) ---
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}