// File: src/modules/product-details/components/ProductGallery.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Play } from "lucide-react"; // Bổ sung icon Play cho thumbnail video

interface ProductGalleryProps {
  images: string[];
  videos?: string[]; // Thêm prop videos
  activeImage?: string | null;
}

// Định nghĩa kiểu chung cho gallery
type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, videos = [], activeImage }) => {
  // Gộp chung videos (hiển thị trước) và images vào một mảng media chung
  const mediaList: MediaItem[] = [
    ...videos.map(v => ({ type: 'video' as const, url: v })),
    ...images.map(i => ({ type: 'image' as const, url: i }))
  ];

  const [selectedMedia, setSelectedMedia] = useState<MediaItem>(
    mediaList[0] || { type: 'image', url: '/assets/placeholder.png' }
  );

  useEffect(() => {
    if (activeImage) {
      const found = mediaList.find(m => m.url === activeImage);
      setSelectedMedia(found || { type: 'image', url: activeImage });
    }
  }, [activeImage]);

  useEffect(() => {
    if (mediaList.length > 0 && !activeImage) {
      setSelectedMedia(mediaList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, videos]);

  return (
    <div className="flex flex-col gap-4">
      {/* Khung hiển thị Media chính */}
      <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group cursor-zoom-in flex items-center justify-center">
        {selectedMedia.type === 'video' ? (
          <video
            src={selectedMedia.url}
            controls
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={selectedMedia.url}
            alt="Product details"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              if (!el.dataset.fallback) {
                el.dataset.fallback = "1";
                el.src = "/assets/placeholder.png";
              }
            }}
          />
        )}
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Hot
        </div>
      </div>

      {/* Danh sách Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {mediaList.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectedMedia(item)}
            onMouseEnter={() => setSelectedMedia(item)}
            className={`
                relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200
                ${selectedMedia.url === item.url 
                    ? "border-brand-orange shadow-md ring-2 ring-orange-100 ring-offset-1" 
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
                }
            `}
          >
            {item.type === 'video' ? (
              <div className="w-full h-full relative bg-black flex items-center justify-center">
                <video src={item.url} className="w-full h-full object-cover opacity-60" />
                <Play className="absolute text-white/90 drop-shadow-md" size={24} fill="currentColor" />
              </div>
            ) : (
              <img
                src={item.url}
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
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;