// src/modules/product-detail/components/ProductDescription.tsx
"use client";
import React, { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

interface ProductDescriptionProps {
  productTitle: string;
  description?: string;
}
const ProductDescription: React.FC<ProductDescriptionProps> = ({productTitle, description}) => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    // Fix #43: padding y nhỏ + không content empty → bớt khoảng trắng dôi.
    <div className="bg-white rounded-2xl px-6 py-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-3 px-6 text-base font-medium transition-colors ${
            activeTab === "details"
              ? "text-brand-orange border-b-2 border-brand-orange"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Chi tiết sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`py-3 px-6 text-base font-medium transition-colors ${
            activeTab === "reviews"
              ? "text-brand-orange border-b-2 border-brand-orange"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Đánh giá sản phẩm
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "details" && (
          // Sử dụng class 'prose' của Tailwind Typography để tự động format text
          <div className="prose prose-sm max-w-none text-black prose-h3:font-semibold prose-h3:mt-0 prose-h3:mb-3 prose-h4:font-semibold">
            <h3>MÔ TẢ SẢN PHẨM</h3>
            {/* Fix BUG-FE-3 (wiki 0030): sanitize HTML từ seller — chống stored XSS */}
            <div dangerouslySetInnerHTML={sanitizeHtml(description)} />
          </div>
        )}
        {activeTab === "reviews" && (
          <p className="text-gray-500 text-sm py-4">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;