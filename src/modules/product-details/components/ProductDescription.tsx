// src/modules/product-detail/components/ProductDescription.tsx
"use client";
import React, { useState } from "react";

interface ProductDescriptionProps {
  productTitle: string; 
  description?: string;
}
const ProductDescription: React.FC<ProductDescriptionProps> = ({productTitle, description}) => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-4 px-6 text-lg font-medium transition-colors ${
            activeTab === "details"
              ? "text-brand-orange border-b-2 border-brand-orange"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Chi tiết sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`py-4 px-6 text-lg font-medium transition-colors ${
            activeTab === "reviews"
              ? "text-brand-orange border-b-2 border-brand-orange"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Đánh giá sản phẩm
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "details" && (
          // Sử dụng class 'prose' của Tailwind Typography để tự động format text
          <div className="prose prose-sm max-w-none text-black prose-h3:font-semibold prose-h4:font-semibold">
            <h3>MÔ TẢ SẢN PHẨM</h3>
            <br />
            <div dangerouslySetInnerHTML={{ __html: description || "" }} />
          </div>
        )}
        {activeTab === "reviews" && (
          <div>
            <p className="text-gray-600">
              {/* Chưa có đánh giá nào cho sản phẩm này. */}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;