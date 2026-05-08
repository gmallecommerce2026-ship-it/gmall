// src/modules/home/components/CategoryTwoRowSection.tsx
'use client'; 

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic'; 
import ProductCard from '@/modules/product/components/ProductCard';

const ChevronLeft = dynamic(() => import('lucide-react').then((mod) => mod.ChevronLeft), { ssr: false });
const ChevronRight = dynamic(() => import('lucide-react').then((mod) => mod.ChevronRight), { ssr: false });
const ArrowRight = dynamic(() => import('lucide-react').then((mod) => mod.ArrowRight), { ssr: false });

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export interface SectionColumnData {
  title: string;
  products: any[];
  viewAllLink: string;
  headerColor?: string;
  emoji?: string;
  filters?: string[];
  activeFilter?: string;
  onFilterSelect?: (item: string) => void;
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <SectionColumn config={leftColumnData} />
        <SectionColumn config={rightColumnData} />
      </div>
    </section>
  );
};

const SectionColumn = ({ config }: { config: SectionColumnData }) => {
  const safeConfig = config || {};
  const { title, products, viewAllLink, emoji, headerColor, filters, activeFilter, onFilterSelect } = safeConfig;
  // hooks-fix wiki 0031: useMemo cho derived arrays để dep effect ổn định identity
  const safeFilters = useMemo(() => (Array.isArray(filters) ? filters : []), [filters]);
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);
  const hasFilters = safeFilters.length > 0;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  // hooks-fix wiki 0031: setIsClient là hydration flag — disable rule
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    if (safeProducts.length > 4) {
      const shuffled = shuffleArray(safeProducts);
      setDisplayProducts(shuffled.slice(0, 4));
    } else {
      setDisplayProducts(safeProducts);
    }
  }, [safeProducts]);

  // Logic Scroll cho Filter
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
  }, [safeFilters, hasFilters]);

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
    <div className="bg-white border border-gray-100 rounded-lg p-3 md:p-4 shadow-sm h-full flex flex-col group/container">
      
      {/* === HEADER AREA === */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 min-h-[32px]`}>
        
        {/* Title + Mobile ViewAll */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2">
            {emoji && <span className="text-lg md:text-xl">{emoji}</span>}
            <h3 className={`text-base md:text-lg font-bold uppercase tracking-wide whitespace-nowrap ${headerColor || 'text-gray-800'}`}>
              {title}
            </h3>
          </div>

          <Link 
            href={viewAllLink || '#'}
            className="md:hidden flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-brand-orange transition-colors"
          >
            <span>Xem thêm</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Filters (Horizontal Scroll) */}
        {hasFilters && (
          // PC Fix: min-w-0 flex-1 để không bị vỡ layout flex khi nội dung filter dài
          <div className="relative w-full md:flex-1 md:mx-4 md:min-w-0 h-[32px] flex items-center group/scroll-area mt-1 md:mt-0">
            <button 
              onClick={(e) => { e.preventDefault(); scroll('left'); }}
              className={`absolute left-0 z-10 bg-white/95 shadow-sm border border-gray-100 rounded-full p-0.5 h-6 w-6 flex items-center justify-center text-gray-600 hover:text-brand-orange transition-all duration-200 
                ${showLeftArrow ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-2'}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div 
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full px-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {safeFilters.map((filter, idx) => {
                const isActive = filter === activeFilter;
                return (
                  <button
                    key={idx}
                    onClick={() => onFilterSelect && onFilterSelect(filter)}
                    className={`whitespace-nowrap px-3 py-1.5 md:py-1 rounded-full text-xs font-medium border transition-colors shrink-0 select-none
                        ${isActive 
                            ? 'bg-orange-50 text-brand-orange border-orange-200' 
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
               <div className="absolute right-0 h-full flex items-center z-10 pl-4 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none">
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

        {/* Desktop ViewAll */}
        <Link 
          href={viewAllLink || '#'}
          className="hidden md:flex shrink-0 group/link items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-brand-orange transition-colors"
        >
          <span className="hidden sm:inline">Xem thêm</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* === PRODUCTS GRID/SCROLL === */}
      {/* Mobile Has Filter: Flex Row (1 hàng ngang).
          Mobile No Filter: Grid Rows 2 + Flow Col (2 hàng ngang).
          Desktop: Grid Cols 3 (1 hàng tĩnh).
      */}
      <div className={`mt-auto ${hasFilters ? 'flex overflow-x-auto gap-3 pb-2 snap-x no-scrollbar md:grid md:grid-cols-3 md:gap-2 md:pb-0' : 'grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-2 snap-x no-scrollbar auto-cols-[minmax(150px,1fr)] md:grid-rows-none md:grid-flow-row md:grid-cols-3 md:pb-0 md:auto-cols-auto'}`}>
        {!isClient ? (
           Array(4).fill(0).map((_, i) => (<div key={i} className={`bg-gray-50 rounded animate-pulse min-h-[250px] ${hasFilters ? 'min-w-[160px] md:min-w-0' : ''} ${i === 3 ? 'block md:hidden' : ''}`}></div>))
        ) : displayProducts.length > 0 ? (
          displayProducts.map((product: any, index: number) => (
            <div 
              key={product.id || index} 
              className={`animate-in fade-in duration-500 snap-center ${hasFilters ? 'min-w-[160px] md:min-w-0' : ''} ${index === 3 ? 'block md:hidden' : ''}`}
            >
              <ProductCard 
                // 1. Spread properties
                {...product}
                
                // 2. Basic props
                id={product.id}
                image={product.image || product.imageUrl}
                title={product.title || product.name}
                
                // 3. Price props - Đảm bảo truyền đúng originalPrice
                price={product.price}
                originalPrice={product.originalPrice || product.regularPrice} // Fallback tại đây nếu cần
                
                // 4. Discount props - Truyền tường minh
                isDiscountActive={product.isDiscountActive}
                discountType={product.discountType}
                discountValue={product.discountValue}
                
                // 5. QUAN TRỌNG: Sửa 'data' thành 'product' (hoặc truyền cả 2 để an toàn)
                // Nhiều component ProductCard cũ thường check prop 'product' chứ không phải 'data'
                product={product} 
                data={product}

                // 6. Các thông số phụ
                sold={product.sold || product.salesCount}
                tag={product.tag}
                discount={product.discount} 
              />
            </div>
          ))
        ) : (
          <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-sm w-full">Đang cập nhật...</div>
        )}
      </div>
    </div>
  );
};

export default CategoryTwoRowSection;