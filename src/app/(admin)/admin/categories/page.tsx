// src/app/(admin)/admin/categories/page.tsx
import { redirect } from 'next/navigation';

// wiki 0110 — màn quản lý danh mục THẬT là `/admin/mega-menu`.
//
// Trang này là bản cũ, mồ côi (không có trong sidebar) và làm được ít hơn hẳn: chỉ liệt kê
// danh mục dạng phẳng và tạo mới, còn hai nút "Sửa"/"Xoá" thì **không gắn onClick** — bấm
// không có gì xảy ra. Trong khi `/admin/mega-menu` nhúng `CategoryTreeManager` với đủ cây
// phân cấp, sửa, xoá và kéo-thả sắp xếp (`POST /categories/update-order`).
//
// Chuyển hướng thay vì xoá hẳn để URL cũ trong bookmark vẫn tới đúng chỗ.
export default function AdminCategoriesRedirect() {
  redirect('/admin/mega-menu');
}
