// src/app/(admin)/admin/create-user/page.tsx
import { redirect } from 'next/navigation';

// wiki 0110 — tạo tài khoản đã nằm sẵn trong `/admin/users`.
//
// Trang này là bản rời, mồ côi (không có trong sidebar, không nơi nào link tới) và gọi
// đúng cùng một API `POST /admin/users` như hộp thoại "Thêm người dùng mới" ở trang danh
// sách. Bản trong `/admin/users` còn nhiều hơn: tạo được tài khoản SELLER kèm tên shop và
// số điện thoại — hai trường mà trang rời này không có.
//
// Chuyển hướng thay vì xoá hẳn để URL cũ vẫn tới đúng chỗ.
export default function CreateUserRedirect() {
  redirect('/admin/users');
}
