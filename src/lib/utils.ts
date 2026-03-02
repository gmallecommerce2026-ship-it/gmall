// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm gộp class cho Tailwind (nếu bạn dùng cn() ở nơi khác, nếu không có thể bỏ qua)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function toSlug(str: string): string {
    if (!str) return "";
    
    // Normalize Vietnamese accents
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    
    // Remove special chars
    str = str.replace(/([^0-9a-z-\s])/g, '');
    
    // Replace spaces with hyphens
    str = str.replace(/(\s+)/g, '-');
    
    // Remove leading/trailing hyphens
    str = str.replace(/^-+|-+$/g, '');
    
    return str;
}
// Hàm format tiền tệ VNĐ
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function getProductPriceInfo(product: any) {
  const originalPrice = product.originalPrice || product.price || 0;
  let finalPrice = originalPrice;
  let discountLabel = null;

  if (product.isDiscountActive) {
    if (product.discountType === 'PERCENT') {
      const percent = product.discountValue || 0;
      finalPrice = originalPrice * (1 - percent / 100);
      discountLabel = `-${percent}%`;
    } else if (product.discountType === 'AMOUNT') {
      const amount = product.discountValue || 0;
      finalPrice = Math.max(0, originalPrice - amount);
      // Format 50000 -> -50k (optional formatting) or just -50.000đ
      discountLabel = `-${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
    }
  }

  return { originalPrice, finalPrice, discountLabel };
}