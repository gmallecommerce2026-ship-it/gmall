import React, { Suspense } from "react";
import AddProductPage from "@/modules/seller/products/AddProductPage";

export const metadata = {
  title: "Thêm sản phẩm mới | Kênh người bán",
  description: "Trang thêm sản phẩm mới cho người bán",
};

// [QUAN TRỌNG] Dòng này tắt Static Generation, chuyển sang Dynamic Rendering
// Giúp fix lỗi build "useSearchParams() ... csr-bailout"
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Đang tải trang...</div>}>
      <AddProductPage />
    </Suspense>
  );
}