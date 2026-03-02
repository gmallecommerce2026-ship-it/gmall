import React, { Suspense } from "react";
import ShopDecorationClient from "./ShopDecorationClient";

export const metadata = {
  title: "Trang trí Shop | Kênh người bán",
  description: "Thiết kế giao diện cửa hàng của bạn",
};

export default function ShopDecorationPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải trình thiết kế...</div>}>
      <ShopDecorationClient />
    </Suspense>
  );
}