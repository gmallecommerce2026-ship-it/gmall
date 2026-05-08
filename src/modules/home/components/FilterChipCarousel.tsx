"use client";

import React, { useRef, useState, useEffect, WheelEvent, useCallback } from "react";

// [FIX] Cập nhật Interface đúng với cách sử dụng ở HomeClient
interface FilterChipCarouselProps {
  items: string[];
  selectedItem?: string;
  onSelect?: (item: string) => void;
}

const FilterChipCarousel: React.FC<FilterChipCarouselProps> = ({ 
  items, 
  selectedItem, 
  onSelect 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(100);
  const [barLeft, setBarLeft] = useState(0);

  // --- Logic xử lý scroll (giữ nguyên logic gốc của bạn) ---
  const handleWheelScroll = useCallback((e: WheelEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const canScrollHorizontally = el.scrollWidth > el.clientWidth;
    if (!canScrollHorizontally) return;

    // Ngăn trang cuộn dọc khi đang cuộn ngang component này
    if (e.deltaY !== 0) {
      const isAtRightEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      const isAtLeftEnd = el.scrollLeft <= 0;

      // Chỉ chặn scroll trang nếu chưa cuộn hết nội dung ngang
      if ((e.deltaY > 0 && !isAtRightEnd) || (e.deltaY < 0 && !isAtLeftEnd)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    } else if (e.deltaX !== 0) {
       e.preventDefault();
       el.scrollLeft += e.deltaX;
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const wheelHandler = (e: Event) => handleWheelScroll(e as unknown as WheelEvent);
    el.addEventListener('wheel', wheelHandler, { passive: false });
    return () => el.removeEventListener('wheel', wheelHandler);
  }, [handleWheelScroll]);

  // --- Cập nhật thanh progress bar ---
  const updateScrollBar = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    
    if (scrollWidth <= clientWidth) {
      setBarWidth(100);
      setBarLeft(0);
      return;
    }
    const widthPercent = (clientWidth / scrollWidth) * 100;
    const leftPercent = (scrollLeft / scrollWidth) * 100;
    setBarWidth(widthPercent);
    setBarLeft(leftPercent);
  };

  // hooks-fix wiki 0031: updateScrollBar đo DOM rồi setState — đây là sync với external system
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateScrollBar();
        el.addEventListener("scroll", updateScrollBar);
        window.addEventListener("resize", updateScrollBar);
        return () => {
            el.removeEventListener("scroll", updateScrollBar);
            window.removeEventListener("resize", updateScrollBar);
        };
    }
  }, [items]);

  // Nếu không có items thì không render gì cả
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full relative group">
      {/* Container danh sách filters */}
      <div
        ref={scrollContainerRef}
        className="flex flex-row justify-start items-center gap-2 w-full overflow-x-auto no-scrollbar pb-2"
      >
        {items.map((item, index) => {
            const isActive = item === selectedItem;
            return (
                <button 
                    key={`${item}-${index}`} 
                    onClick={() => onSelect && onSelect(item)}
                    className={`
                        flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap
                        ${isActive 
                            ? 'bg-orange-50 text-brand-orange border-brand-orange shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange hover:text-brand-orange'
                        }
                    `}
                >
                    {item}
                </button>
            );
        })}
      </div>

      {/* Thanh Scrollbar UI (chỉ hiện khi cần cuộn) */}
      {barWidth < 100 && (
          <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="h-full bg-brand-orange/50 rounded-full"
              style={{
                width: `${barWidth}%`,
                marginLeft: `${barLeft}%`,
                transition: "width 0.1s, margin-left 0.1s",
              }}
            ></div>
          </div>
      )}
    </div>
  );
};

export default FilterChipCarousel;