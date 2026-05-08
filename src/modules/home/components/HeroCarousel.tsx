// src/modules/home/components/HeroCarousel.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTracking } from "@/hooks/useTracking";
import Link from "next/link";

interface Slide {
  id?: number;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  theme?: string;
}

interface HeroCarouselProps {
  slides: Slide[]; 
  autoPlayInterval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { track } = useTracking();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleBannerClick = (slideIndex: number) => {
    track('select_promotion', `banner_home_${slideIndex}`, {
      creative_name: slides[slideIndex].alt,
      position: `slot_${slideIndex}`
    });
  };

  // hooks-fix wiki 0031: useCallback cho goToNext để stable identity (dùng trong effect autoplay)
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    resetTimeout();
    if (autoPlayInterval) {
      timeoutRef.current = setTimeout(goToNext, autoPlayInterval);
    }
    return () => resetTimeout();
  }, [currentIndex, autoPlayInterval, goToNext]);

  if (!slides || slides.length === 0) return null;

  return (
    // [FIX APPLIED]
    // 1. [mask-image:linear-gradient(white,white)]: Fix lỗi overflow border-radius trên Safari/Chrome khi con scale.
    // 2. isolate: Tạo stacking context riêng biệt.
    // 3. transform-gpu: Ép render layer riêng để mượt mà.
    <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-gray-200 group isolate shadow-sm [mask-image:linear-gradient(white,white)] [backface-visibility:hidden] transform-gpu">
      
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={index}
            onClick={() => isActive && handleBannerClick(index)}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out
              ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          >
            {/* Image Container */}
            {/* Thêm overflow-hidden lần nữa ở đây để double-check việc cắt góc cho ảnh con */}
            <div className="w-full h-full overflow-hidden rounded-[4px]">
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat will-change-transform transition-transform duration-[2000ms] ease-out"
                  style={{ 
                      backgroundImage: `url(${slide.src})`,
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      // Giúp trình duyệt hiểu đây là layer 3D, hỗ trợ khử răng cưa tốt hơn khi scale
                      transformOrigin: 'center center' 
                  }}
                  aria-label={slide.alt}
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-16 lg:px-20 max-w-2xl text-white">
                <div className={`transition-all duration-700 delay-300 transform 
                    ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                    
                    {slide.title && (
                        /* [FIX] Responsive font size: text-xl trên mobile */
                        <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 leading-tight tracking-tight drop-shadow-lg">
                            {slide.title}
                        </h2>
                    )}
                    
                    {slide.description && (
                        /* [FIX] Responsive text size & line-clamp: text-xs và giới hạn 2 dòng trên mobile */
                        <p className="text-xs sm:text-sm md:text-lg text-gray-100 mb-3 md:mb-6 leading-relaxed max-w-md drop-shadow-md line-clamp-2 md:line-clamp-none">
                            {slide.description}
                        </p>
                    )}

                    {slide.ctaLabel && (
                        <Link 
                            href={slide.ctaLink || "#"}
                            onClick={(e) => e.stopPropagation()}
                            /* [FIX] Giảm kích thước nút bấm trên mobile */
                            className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-brand-orange hover:bg-orange-600 text-white text-xs md:text-sm font-bold rounded-[4px] transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
                        >
                            {slide.ctaLabel}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
          </div>
        );
      })}

      {/* Border Overlay - Rất quan trọng để che đi mép răng cưa nếu mask chưa xử lý triệt để */}
      <div className="absolute inset-0 rounded-[4px] ring-1 ring-black/5 pointer-events-none z-40" />

      {/* Navigation Buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
        className={`absolute top-1/2 left-4 z-50 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 text-white rounded-[4px]
        backdrop-blur-md opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0
        transition-all duration-300 border border-white/10`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        className={`absolute top-1/2 right-4 z-50 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 text-white rounded-[4px]
        backdrop-blur-md opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0
        transition-all duration-300 border border-white/10`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-8 md:left-16 lg:left-20 flex items-center space-x-2 z-50">
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(slideIndex); }}
            className={`relative h-1 rounded-[1px] cursor-pointer overflow-hidden transition-all duration-300 ease-out
              ${currentIndex === slideIndex ? "w-8 bg-white/20" : "w-2 bg-white/40 hover:bg-white/80"}
            `}
          >
            {currentIndex === slideIndex && (
               <div className="absolute top-0 left-0 h-full bg-white animate-[progress_linear_forwards]" 
                    style={{ 
                        animationDuration: `${autoPlayInterval}ms`,
                        width: '0%' 
                    }}
               />
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;