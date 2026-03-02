// src/modules/product-detail/components/ProductGallery.tsx
"use client";
import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  // Lấy ảnh đầu tiên làm ảnh chính mặc định
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Ảnh chính */}
      <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border">
        <img
          src={selectedImage}
          alt="Selected product"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Danh sách ảnh thumbnails */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
              selectedImage === img
                ? "border-brand-orange"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;