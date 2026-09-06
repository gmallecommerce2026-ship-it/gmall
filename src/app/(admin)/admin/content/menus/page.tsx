// src/app/(admin)/admin/content/menus/page.tsx
import { redirect } from 'next/navigation';

// wiki 0110 — màn này đã gộp vào `/admin/content`.
//
// Trước đây đây là một trang MỒ CÔI (không có trong sidebar) hiển thị 4 tab menu bằng
// chính `MenuConfigEditor` mà `/admin/content` đang dùng, sửa cùng những key config đó
// (`HEADER_RECIPIENT` / `HEADER_OCCASION` / `HEADER_BUSINESS` / `HEADER_BLOG_TOPIC`).
// Hai màn hình sửa cùng một dữ liệu chỉ tạo cơ hội ghi đè lẫn nhau. Key duy nhất bên này
// có mà bên kia thiếu — Menu Chủ Đề Blog — đã được thêm vào `ContentClient.tsx`.
//
// Giữ lại đường dẫn cũ dưới dạng chuyển hướng thay vì xoá hẳn: URL này có thể đã nằm
// trong bookmark hoặc ghi chú bàn giao, và một cú nhảy sang màn đúng thì tốt hơn 404.
export default function MenuManagementRedirect() {
  redirect('/admin/content');
}
