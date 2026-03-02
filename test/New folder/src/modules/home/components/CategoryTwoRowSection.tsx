'use client'; 

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic'; 
import ProductCard from '@/modules/product/components/ProductCard';

const ChevronLeft = dynamic(() => import('lucide-react').then((mod) => mod.ChevronLeft), { ssr: false });
const ChevronRight = dynamic(() => import('lucide-react').then((mod) => mod.ChevronRight), { ssr: false });
const ArrowRight = dynamic(() => import('lucide-react').then((mod) => mod.ArrowRight), { ssr: false });

// [FIX] Cập nhật Interface: Thêm activeFilter và onFilterSelect
export interface SectionColumnData {
  title: string;
  products: any[];
  viewAllLink: string;
  headerColor?: string;
  emoji?: string;
  filters?: string[];
  activeFilter?: string;               // <-- Thêm dòng này
  onFilterSelect?: (item: string) => void; // <-- Thêm dòng này
}

interface CategoryTwoRowSectionProps {
  leftColumnData: SectionColumnData;
  rightColumnData: SectionColumnData;
}

const CategoryTwoRowSection: React.FC<CategoryTwoRowSectionProps> = ({
  leftColumnData,
  rightColumnData,
}) => {
  return (
    <section className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        <SectionColumn config={leftColumnData} />
        <SectionColumn config={rightColumnData} />
      </div>
    </section>
  );
};

const SectionColumn = ({ config }: { config: SectionColumnData }) => {
  const { 
    title, 
    products = [], 
    viewAllLink, 
    emoji, 
    headerColor, 
    filters = [],
    activeFilter,  // [FIX] Lấy activeFilter từ config
    onFilterSelect // [FIX] Lấy onFilterSelect từ config
  } = config;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const hasFilters = Array.isArray(filters) && filters.length > 0;

  useEffect(() => {
    if (!hasFilters) return;
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [hasFilters]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 1);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    if (hasFilters) {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }
  }, [filters, hasFilters]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[4px] p-3 md:p-4 shadow-sm h-full flex flex-col group/container">
      {/* Header Area */}
      <div className="flex items-center justify-between gap-2 mb-3 min-h-[32px]">
        <div className="flex items-center gap-2 shrink-0">
          {emoji && <span className="text-lg md:text-xl">{emoji}</span>}
          <h3 className={`text-base md:text-lg font-bold uppercase tracking-wide whitespace-nowrap ${headerColor || 'text-gray-800'}`}>
            {title}
          </h3>
        </div>

        {/* Filters Scroll */}
        {hasFilters && (
          <div className="flex-1 relative min-w-0 mx-2 h-[32px] flex items-center group/scroll-area">
            <button 
              onClick={(e) => { e.preventDefault(); scroll('left'); }}
              className={`absolute left-0 z-10 bg-white/95 shadow-sm border border-gray-100 rounded-full p-0.5 h-6 w-6 flex items-center justify-center text-gray-600 hover:text-brand-orange transition-all duration-200 ${showLeftArrow ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-2'}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div 
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full px-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filters.map((filter, idx) => {
                // [FIX] Kiểm tra trạng thái active
                const isActive = filter === activeFilter;
                return (
                  <button
                    key={idx}
                    onClick={() => onFilterSelect && onFilterSelect(filter)} // Gọi hàm select
                    className={`whitespace-nowrap px-2.5 py-1 rounded-[2px] text-xs font-medium border transition-colors shrink-0 select-none
                        ${isActive 
                            ? 'bg-orange-50 text-brand-orange border-orange-100' 
                            : 'bg-gray-50 text-gray-600 border-transparent hover:bg-orange-50 hover:text-brand-orange hover:border-orange-100'
                        }
                    `}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {showRightArrow && (
               <div className="absolute right-0 h-full flex items-center z-10 pl-4 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none">
                   <button 
                    onClick={(e) => { e.preventDefault(); scroll('right'); }}
                    className="bg-white shadow-sm border border-gray-100 rounded-full p-0.5 h-6 w-6 flex items-center justify-center text-gray-600 hover:text-brand-orange pointer-events-auto transition-transform hover:scale-105"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
               </div>
            )}
          </div>
        )}

        <Link 
          href={viewAllLink}
          className="shrink-0 group/link flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-brand-orange transition-colors"
        >
          <span className="hidden sm:inline">Xem thêm</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid Products */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-auto">
        {products.length > 0 ? (
          products.slice(0, 3).map((product, index) => (
            <div 
              key={product.id || index} 
              // [FIX] Ẩn item thứ 3 trên mobile để chỉ hiển thị 2 item/hàng
              className={`h-full ${index === 2 ? 'hidden md:block' : ''}`}
            >
              <ProductCard 
                id={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                sold={product.sold}
                tag={product.tag}
                discount={product.discount}
              />
            </div>
          ))
        ) : (
          // [FIX] Col-span cũng cần responsive tương ứng
          <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-sm">
            Đang cập nhật...
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTwoRowSection;