// src/app/(admin)/admin/categories/page.tsx
import React, { Suspense } from "react";
import CategoriesClient from "./CategoriesClient";

// Chỉ thị này hoạt động tốt nhất ở Server Component
export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    // Suspense Boundary là bắt buộc khi Client Component có khả năng dùng useSearchParams
    <Suspense fallback={<div className="p-6">Đang tải danh mục...</div>}>
      <CategoriesClient />
    </Suspense>
  );
}