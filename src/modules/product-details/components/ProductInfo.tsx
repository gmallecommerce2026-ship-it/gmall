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
          const sd = (product as any).shortDesc;
          let short = "";
          if (sd && typeof sd === "object") {
            short = sd.brand || sd.note || "";
          }
          if (!short && product.description) {
            short = String(product.description)
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }

          return (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {short || "Thông tin mô tả chi tiết sản phẩm đang được cập nhật."}
            </p>
          );
        })()}
      </div>
    </div>
  );
};

export default ProductInfo;