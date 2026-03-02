import React, { Suspense } from "react";
import ShopProfileClient from "./ShopProfileClient";

export const metadata = {
  title: "Hồ sơ Shop | Kênh người bán",
  description: "Cập nhật thông tin cửa hàng của bạn",
};

// [QUAN TRỌNG] Tắt Static Generation để fix lỗi build
export const dynamic = 'force-dynamic';

export default function ShopProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Đang tải hồ sơ...</div>}>
      <ShopProfileClient />
    </Suspense>
  );
}