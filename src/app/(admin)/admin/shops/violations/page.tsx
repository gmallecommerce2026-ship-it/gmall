// src/app/(admin)/admin/shops/violations/page.tsx
import { redirect } from 'next/navigation';

// wiki 0110 — "vi phạm cửa hàng" nay là màn Khiếu nại & Báo lỗi (`/admin/complaints`).
//
// Trang này từng là khung trống có chủ đích: bản gốc hiển thị 4 bản ghi vi phạm BỊA nêu
// đích danh cửa hàng cùng ba ô thống kê hardcode; wiki trước đã gỡ hết phần bịa và để lại
// một khung "Module chưa được kết nối" — vì BE chưa từng có `admin/shops/violations`.
//
// Nay chỗ trống đó đã có thứ thật để thay: `Complaint` + `/admin/complaints` (BE có sẵn,
// người bán đang gửi vào đó qua `/seller-dashboard/help/reports`). Đưa người dùng sang màn
// làm được việc, thay vì giữ một trang chỉ để nói "chưa có gì".
//
// Cần khoá/mở khoá cửa hàng thì vẫn ở `/admin/users/sellers` (`PATCH /admin/users/:id/ban-status`).
export default function ShopViolationsRedirect() {
  redirect('/admin/complaints');
}
