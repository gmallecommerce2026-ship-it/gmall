// src/types/product.ts

// 1. Định nghĩa Tier (Nhóm phân loại) - Ví dụ: Màu sắc, Kích thước
export interface ProductTier {
  name: string;        // Tên nhóm (VD: "Màu sắc")
  options: string[];   // Các tùy chọn (VD: ["Đỏ", "Xanh"])
  images?: string[];   // Ảnh đại diện cho từng option (thường dùng cho nhóm 1)
}

// 2. Định nghĩa Variant (Biến thể SKU) - Ví dụ: Màu Đỏ - Size S
export interface ProductVariant {
  id?: string;         // ID của biến thể (nếu có từ DB)
  price: number;       // Giá của biến thể này
  originalPrice?: number; // Giá gốc (để hiện gạch ngang nếu có giảm giá)
  stock: number;       // Tồn kho của biến thể này
  sku?: string;        // Mã SKU riêng
  imageUrl?: string;   // Ảnh riêng của biến thể (nếu có)
  tierIndex: number[]; // Quan trọng: Mapping vị trí index. VD: [0, 1] -> Option 0 của Tier 1 + Option 1 của Tier 2
}

// 3. Interface Product đầy đủ
export interface Product {
  id: string;
  title: string;          // Tên sản phẩm
  description?: string;   // Mô tả HTML hoặc text
  
  // --- Giá & Kho (Hiển thị mặc định khi chưa chọn phân loại) ---
  price: number;          // Giá bán hiện tại (hoặc giá thấp nhất)
  regularPrice?: number;  // Giá niêm yết (nếu có giảm giá)
  discountPercent?: number; // % giảm giá (VD: 10, 20)
  stockTotal?: number;     // Tổng tồn kho của tất cả biến thể
  stock?: number;          // Alias cho stockTotal (tùy backend trả về field nào)

  // --- Hình ảnh & Media ---
  imageUrl: string;       // Ảnh đại diện chính (Thumbnail)
  images?: string[];      // Danh sách ảnh gallery
  videos?: string[];      // Danh sách video

  // --- Thông tin SEO / Chi tiết ---
  brand?: string;
  origin?: string;
  attributes?: Record<string, any>; // Các thuộc tính JSON khác (Chất liệu,...)
  
  // --- Thông tin người bán ---
  sellerId?: string;      // ID người bán
  shopId?: string;        // Alias cho sellerId (tùy backend trả về)
  shopName?: string;
  shopAvatar?: string;
  
  // --- Phân loại hàng (Dynamic Tiers) ---
  tiers?: ProductTier[];       // Mảng các nhóm phân loại (Màu, Size...)
  variations?: ProductVariant[]; // Danh sách các biến thể SKU
  
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