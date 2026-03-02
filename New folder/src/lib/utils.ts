// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm gộp class cho Tailwind (nếu bạn dùng cn() ở nơi khác, nếu không có thể bỏ qua)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm format tiền tệ VNĐ
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}