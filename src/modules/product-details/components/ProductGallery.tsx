// File: src/modules/product-details/components/ProductGallery.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Play } from "lucide-react"; // Đảm bảo đã import icon

interface ProductGalleryProps {
  images: string[];
  videos?: string[]; // MỚI: Khai báo thêm prop videos
  activeImage?: string | null;
}

// Hàm helper chuyển link Youtube thường thành link Youtube Embed để chạy trong Iframe
const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  return url;
};

const ProductGallery: React.FC<ProductGalleryProps> = ({ images = [], videos = [], activeImage }) => {
  // Gộp chung videos và images lại để hiển thị ở thanh trượt thumbnail
  const allMedia = [...videos, ...images];
  const [selectedMedia, setSelectedMedia] = useState(allMedia[0]);

  // hooks-fix wiki 0031: sync selectedMedia từ prop activeImage
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

  // Các hàm kiểm tra loại Media
  const isVideo = (url: string) => videos.includes(url);
  const isSelectedVideo = selectedMedia ? isVideo(selectedMedia) : false;
  const isYouTube = isSelectedVideo && (selectedMedia.includes('youtube.com') || selectedMedia.includes('youtu.be'));

  return (
    <div className="flex flex-col gap-4">
      {/* Khung ảnh/video chính */}
      <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group flex items-center justify-center">
        {isSelectedVideo ? (
          isYouTube ? (
            // Nếu là Youtube thì DÙNG IFRAME
            <iframe
              className="w-full h-full"
              src={getYoutubeEmbedUrl(selectedMedia)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            // Nếu là link .mp4 thông thường thì DÙNG VIDEO HTML5
            <video
              src={selectedMedia}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )
        ) : (
          // Nếu là ảnh thông thường
          <div className="w-full h-full relative cursor-zoom-in bg-white">
            <img
              src={selectedMedia}
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
            {/* Badge giả lập giữ nguyên từ code cũ của bạn */}
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                Hot
            </div>
          </div>
        )}
      </div>

      {/* Danh sách thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {allMedia.map((media, index) => {
          const mediaIsVideo = isVideo(media);
          const isYtThumb = mediaIsVideo && (media.includes('youtube.com') || media.includes('youtu.be'));
          
          // Lấy ID Youtube để móc thumbnail gốc từ Youtube về hiển thị
          let ytThumbUrl = "";
          if (isYtThumb) {
             const match = media.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
             if (match && match[2].length === 11) {
                 ytThumbUrl = `https://img.youtube.com/vi/${match[2]}/0.jpg`;
             }
          }

          return (
            <button
              key={index}
              onClick={() => setSelectedMedia(media)}
              onMouseEnter={() => setSelectedMedia(media)}
              className={`
                  relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200
                  ${selectedMedia === media 
                      ? "border-brand-orange shadow-md ring-2 ring-orange-100 ring-offset-1" 
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
                  }
              `}
            >
              {mediaIsVideo ? (
                <div className="w-full h-full bg-gray-900 relative flex items-center justify-center">
                  {/* Nếu là Youtube -> Hiện thumbnail của Youtube / Nếu là file mp4 -> Dùng thẻ video mờ làm nền */}
                  {isYtThumb && ytThumbUrl ? (
                     <img src={ytThumbUrl} className="w-full h-full object-cover opacity-60" alt="YT Thumb"/>
                  ) : (
                     <video src={media} className="w-full h-full object-cover opacity-50" />
                  )}
                  {/* Nút Play đè lên trên để phân biệt ảnh và video */}
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
                  className="w-full h-full object-cover bg-white"
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