// src/modules/home/components/SubHeroCarousel.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface Slide {
  src: string;
  alt: string;
  label?: string;
}

interface SubHeroCarouselProps {
  slides: Slide[];
  autoPlayInterval?: number;
}

const SubHeroCarousel: React.FC<SubHeroCarouselProps> = ({
  slides,
  autoPlayInterval = 5000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isDragging) return;
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextSlide, autoPlayInterval, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    setCurrentTranslate(currentX - startX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const dragRatio = currentTranslate / containerWidth;

    // [FIX] Sử dụng dấu DƯƠNG (+) thay vì âm.
    // Logic: Trong getSlideStyle, offset bị trừ đi dragRatio * 1.5.
    // Để tìm index mà tại đó offset về 0 (giữa màn hình), ta cần activeIndex TĂNG thêm một lượng tương ứng.
    const slideDiff = Math.round(dragRatio * 1.5);

    if (slideDiff !== 0) {
      setActiveIndex((prev) => {
        const nextIndex = (prev + slideDiff) % totalSlides;
        
        // Xử lý số âm javascript modulo (ví dụ -1 % 5 = -1)
        if (nextIndex < 0) return nextIndex + totalSlides;
        return nextIndex;
      });
    }

    setIsDragging(false);
    setCurrentTranslate(0);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const getSlideStyle = (index: number) => {
    let offset = (index - activeIndex) % totalSlides;
    if (offset < 0) offset += totalSlides;
    if (offset > totalSlides / 2) offset -= totalSlides;

    const dragRatio = containerRef.current ? currentTranslate / containerRef.current.offsetWidth : 0; 
    const effectiveOffset = offset - dragRatio * 1.5;

    const xOffsetPercent = 25; 
    const absOffset = Math.abs(effectiveOffset);
    let scale = 1 - Math.min(absOffset * 0.1, 0.2);
    let translateX = effectiveOffset * xOffsetPercent;
    let zIndex = 50 - Math.round(absOffset * 10);
    let opacity = 1 - Math.min(Math.abs(effectiveOffset) * 0.5, 0.8);
    let rotateY = effectiveOffset * -10;

    return {
      position: 'absolute' as const,
      top: 0,
      height: '100%',
      transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease',
      transform: `translateX(${translateX}%) scale(${scale}) translateZ(${zIndex}px) rotateY(${rotateY}deg)`,
      zIndex: zIndex,
      opacity: Math.abs(effectiveOffset) > 2 ? 0 : opacity,
      filter: `brightness(${1 - Math.min(absOffset * 0.3, 0.5)})`,
      willChange: 'transform, opacity',
      visibility: Math.abs(effectiveOffset) > 2 ? 'hidden' : 'visible',
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    } as React.CSSProperties;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[100px] lg:h-[150px] mx-auto perspective-1000 select-none touch-pan-y overflow-hidden cursor-grab active:cursor-grabbing mt-0"
      style={{ perspective: '1200px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="relative w-full h-full transform-style-3d flex items-center justify-center">
        {slides.map((slide, index) => {
          let offset = (index - activeIndex) % totalSlides;
          if (offset < 0) offset += totalSlides;
          if (offset > totalSlides / 2) offset -= totalSlides;

          return (
            <div
              key={index}
              // [UPDATE] rounded-[4px]
              className="absolute h-full rounded-[4px] will-change-transform !w-[90%] md:!w-[70%] left-0 right-0 mx-auto overflow-hidden group"
              style={getSlideStyle(index)}
              onClick={() => {
                if (isDragging) return;
                if (offset === 1) nextSlide();
                if (offset === -1) prevSlide();
              }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                // [UPDATE] rounded-[4px]
                className="w-full h-full object-cover rounded-[4px] pointer-events-none select-none" 
              />
              {/* [UPDATE] rounded-[4px] */}
              <div className="absolute inset-0 rounded-[4px] bg-black/10 pointer-events-none" />
              
              {slide.label && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center">
                    <span className="text-white text-sm md:text-base font-bold tracking-wide drop-shadow-sm transform transition-transform group-hover:scale-105">
                        {slide.label}
                    </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubHeroCarousel;