// src/modules/product-details/components/ProductInfo.tsx
"use client";

import React from "react";
import { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Tiêu đề & Đánh giá */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
          {product.title}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-yellow-500">
            <span>★★★★★</span>
            <span className="text-gray-500 ml-2">({product.rating || 5.0})</span>
          </div>
          <span className="w-[1px] h-4 bg-gray-300"></span>
          <span className="text-gray-500">Đã bán {product.salesCount || 0}</span>
          <span className="w-[1px] h-4 bg-gray-300"></span>
          <span className="text-gray-500 font-medium">Thương hiệu: {product.brand || "Chính hãng"}</span>
        </div>
      </div>

      {/* Mô tả ngắn / Đặc điểm nổi bật */}
      <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/80 flex flex-col gap-3">
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
          Mô tả ngắn & Đặc điểm
        </h3>
        {(() => {
          // Wiki 0094 (spec 0018): mô tả ngắn gồm 6 mục — Thương hiệu / Đặc điểm nổi bật /
          // Lợi ích / Phù hợp tặng cho / Dịp tặng / Ghi chú. Seller nhập đủ 6 ở trang thêm SP,
          // nhưng bản trước chỉ render `sd.brand || sd.note` → 4/6 mục KHÔNG BAO GIỜ hiện.
          // (Bản trước nữa còn đọc sai tên trường: `shortDescription` trong khi DB lưu `shortDesc`
          //  → luôn rơi về cắt mô tả dài.)
          const raw = (product as any).shortDesc;
          let sd: Record<string, string> | null = null;
          if (raw) {
            try {
              sd = typeof raw === "string" ? JSON.parse(raw) : raw;
            } catch {
              sd = null;
            }
          }

          const ROWS = [
            { key: "brand", label: "Thương hiệu" },
            { key: "features", label: "Đặc điểm nổi bật" },
            { key: "benefits", label: "Lợi ích" },
            { key: "recipient", label: "Phù hợp tặng cho" },
            { key: "occasion", label: "Dịp tặng" },
            { key: "note", label: "Ghi chú" },
          ];

          const filled = sd
            ? ROWS.filter((r) => typeof sd?.[r.key] === "string" && sd[r.key].trim() !== "")
            : [];

          if (filled.length > 0) {
            return (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {filled.map((r) => (
                  <div key={r.key} className="flex gap-2 text-sm leading-relaxed">
                    <dt className="text-gray-500 shrink-0">{r.label}:</dt>
                    <dd className="text-gray-800 font-medium whitespace-pre-line">
                      {sd?.[r.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            );
          }

          // Chưa nhập mô tả ngắn → rút gọn từ mô tả dài (strip HTML), giữ hành vi cũ.
          const fallback = product.description
            ? String(product.description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
            : "";
          return (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {fallback || "Thông tin mô tả chi tiết sản phẩm đang được cập nhật."}
            </p>
          );
        })()}
      </div>
    </div>
  );
};

export default ProductInfo;