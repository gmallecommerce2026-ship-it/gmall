"use client";
import React, { useEffect, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  activeImage?: string | null;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, activeImage }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  useEffect(() => {
    if (activeImage) {
      setSelectedImage(activeImage);
    }
  }, [activeImage]);

  // Reset về ảnh đầu tiên nếu danh sách ảnh thay đổi hoàn toàn (ví dụ đổi sản phẩm)
  useEffect(() => {
      if (images.length > 0 && !activeImage) {
          setSelectedImage(images[0]);
      }
  }, [images]);
  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh chính - Thêm bo tròn lớn và hiệu ứng shadow nhẹ */}
      <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group cursor-zoom-in">
        <img
          src={selectedImage}
          alt="Product details"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge giả lập (ví dụ) */}
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Hot
        </div>
      </div>

      {/* Danh sách thumbnails - Style hiện đại hơn */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            onMouseEnter={() => setSelectedImage(img)}
            className={`
                relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200
                ${selectedImage === img 
                    ? "border-brand-orange shadow-md ring-2 ring-orange-100 ring-offset-1" 
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
                }
            `}
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