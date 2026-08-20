// src/lib/admin/pendingCounts.ts
'use client';

/**
 * wiki 0111 — cầu nối để các màn duyệt báo cho menu quản trị biết "số việc vừa đổi".
 *
 * Vì sao cần: badge trên menu ban đầu chỉ tải lại khi đổi trang, dựa trên giả định "duyệt
 * xong là admin điều hướng đi". Giả định đó SAI — đọc lại các trang duyệt thì cả
 * `/admin/affiliate`, `/admin/products/approvals`, `/admin/complaints`… đều xử lý tại chỗ:
 * gọi API, lọc dòng vừa duyệt ra khỏi danh sách, rồi ở nguyên trang. Admin duyệt liên tiếp
 * năm hồ sơ thì badge vẫn treo số cũ cho tới khi họ tình cờ sang trang khác — đúng kiểu sai
 * lệch làm người dùng mất tin vào con số, mà mất tin thì badge coi như không tồn tại.
 *
 * Vì sao là sự kiện của `window` chứ không phải store dùng chung: chỉ có MỘT bên phát và
 * MỘT bên nghe, dữ liệu thì đã nằm ở BE. Dựng thêm một store toàn cục cho việc này là thừa;
 * còn hẹn giờ thăm dò nền thì tốn hơn nhiều mà vẫn trễ hơn.
 *
 * Không cần `await`, không cần biết ai đang nghe: nếu menu chưa mount (ví dụ đang ở trang
 * đăng nhập) thì sự kiện rơi vào hư không, hoàn toàn vô hại.
 */

export const PENDING_COUNTS_REFRESH_EVENT = 'gmall:pending-counts-refresh';

/** Gọi sau MỖI thao tác duyệt/từ chối/đổi trạng thái thành công. */
export function notifyPendingCountsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PENDING_COUNTS_REFRESH_EVENT));
}
