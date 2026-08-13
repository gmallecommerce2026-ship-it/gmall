'use client';

// Wiki 0104 (đợt 2) — trang này TRƯỚC ĐÂY là một màn hình quản trị hoàn toàn BỊA:
//
//   * 4 bản ghi vi phạm giả, nêu ĐÍCH DANH cửa hàng kèm cáo buộc ("Tech World
//     Official — Bán hàng giả/nhái", "Baby Care — Hình ảnh nhạy cảm") và trạng thái
//     "Đã khóa". Đây là cáo buộc bịa gán cho tên doanh nghiệp, hiển thị y như dữ
//     liệu thật trên màn hình điều hành.
//   * 3 ô thống kê viết cứng: "Shop đang bị khóa: 24", "Cảnh báo vi phạm: 12",
//     "Đã xử lý tuần này: 45".
//   * Mọi nút (Khóa/Mở khóa/Lọc/Xử lý vi phạm mới/phân trang) đều KHÔNG gắn hành vi.
//
// Đo trên BE prod: không có controller nào cho `admin/shops` hay `violations`
// (`/admin/shops/violations` → 404). Tức phần backend của tính năng này chưa tồn tại.
//
// Vì sao chọn "nói thật là chưa có" thay vì giữ dữ liệu mẫu cho đẹp màn hình: người
// quản trị dùng chính những con số này để ra quyết định khóa/mở cửa hàng. Một màn hình
// trống có thông báo rõ ràng thì vô hại; một màn hình bịa thì dẫn tới hành động sai —
// cùng nguyên tắc đã áp cho màn duyệt chi tiền (`admin/finance/payouts`).
//
// Giữ lại tiêu đề + khung để khi BE có endpoint thì nối vào, không phải dựng lại.

import React from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiShoppingBag } from 'react-icons/fi';

export default function ShopViolationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Vi phạm &amp; Khóa Shop</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý các cửa hàng vi phạm chính sách và xử lý khiếu nại.
        </p>
      </div>

      {/* Trạng thái thật của module */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <FiAlertTriangle className="mt-1 shrink-0 text-yellow-600" size={20} />
        <div className="text-sm">
          <h3 className="font-bold text-yellow-800">Module chưa được kết nối</h3>
          <p className="mt-1 text-yellow-700">
            Phần backend cho danh sách vi phạm chưa có endpoint, nên màn hình này chưa thể
            hiển thị dữ liệu thật. Danh sách để trống là <strong>có chủ đích</strong> — hệ
            thống không hiển thị số liệu phỏng đoán trên màn hình dùng để khóa hoặc mở khóa
            cửa hàng.
          </p>
          <p className="mt-2 text-yellow-700">
            Trong lúc chờ, việc xử lý vi phạm có thể thực hiện qua{' '}
            <Link href="/admin/shops" className="font-medium underline hover:text-yellow-900">
              danh sách cửa hàng
            </Link>{' '}
            và{' '}
            <Link href="/admin/users/sellers" className="font-medium underline hover:text-yellow-900">
              quản lý người bán
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Khung danh sách — giữ lại để nối API khi backend sẵn sàng */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <h3 className="font-semibold text-gray-700">Danh sách vi phạm</h3>
        </div>
        <div className="p-12 text-center">
          <FiShoppingBag className="mx-auto mb-3 text-3xl text-gray-300" />
          <p className="font-medium text-gray-600">Chưa có dữ liệu vi phạm</p>
          <p className="mt-1 text-sm text-gray-400">
            Dữ liệu sẽ hiển thị tại đây sau khi endpoint quản lý vi phạm được bổ sung.
          </p>
        </div>
      </div>
    </div>
  );
}
