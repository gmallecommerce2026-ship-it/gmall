// src/modules/product-details/components/ProductGallery.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Play } from "lucide-react"; // Import icon nút Play để hiển thị ở thumbnail

interface ProductGalleryProps {
  images: string[];
  videos?: string[]; // MỚI: Thêm mảng videos
  activeImage?: string | null;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images = [], videos = [], activeImage }) => {
  // Gộp videos lên trước images (Tối ưu UX: user thường xem video trước)
  const allMedia = [...videos, ...images];
  const [selectedMedia, setSelectedMedia] = useState(allMedia[0]);

  useEffect(() => {
    if (activeImage) {
      setSelectedMedia(activeImage);
    }
  }, [activeImage]);

  useEffect(() => {
    if (allMedia.length > 0 && !activeImage) {
      setSelectedMedia(allMedia[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, videos]);

  // Hàm kiểm tra xem media hiện tại có phải là video không
  const isVideo = (url: string) => videos.includes(url);
  const isSelectedVideo = isVideo(selectedMedia);

  return (
    <div className="flex flex-col gap-4">
      {/* Khung hiển thị Media chính */}
      <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group flex items-center justify-center">
        {isSelectedVideo ? (
          <video
            src={selectedMedia}
            controls
            autoPlay
            muted // Nên để muted nếu autoPlay để trình duyệt không block
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={selectedMedia}
            alt="Product details"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in bg-white"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              if (!el.dataset.fallback) {
                el.dataset.fallback = "1";
                el.src = "/assets/placeholder.png";
              }
            }}
          />
        )}
      </div>

      {/* Danh sách Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {allMedia.map((media, index) => {
          const mediaIsVideo = isVideo(media);
          return (
            <button
              key={index}
              onClick={() => setSelectedMedia(media)}
              onMouseEnter={() => setSelectedMedia(media)}
              className={`
                relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200
                ${
                  selectedMedia === media
                    ? "border-brand-orange shadow-md ring-2 ring-orange-100 ring-offset-1"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
                }
              `}
            >
              {mediaIsVideo ? (
                <div className="w-full h-full bg-black relative flex items-center justify-center">
                  {/* Thumbnail mờ cho video */}
                  <video src={media} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 p-1.5 rounded-full">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={media}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (!el.dataset.fallback) {
                      el.dataset.fallback = "1";
                      el.src = "/assets/placeholder.png";
                    }
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGallery;