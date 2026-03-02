// src/modules/home/components/DynamicSectionRenderer.tsx
'use client';

import Link from 'next/link';
import ProductCard from '@/modules/product/components/ProductCard';
import { ChevronRight } from 'lucide-react';
// [THÊM] Import component xử lý 2 cột
import CategoryTwoRowSection from './CategoryTwoRowSection'; 

interface SectionProps {
  data: any; 
}

export default function DynamicSectionRenderer({ data }: SectionProps) {
  const { title, type, config, products, category, promotion } = data;

  // === FIX: THÊM CASE RENDER CHO LOẠI 2 CỘT ===
  if (type === 'CATEGORY_TWO_ROW') {
    // Lúc này backend đã trả về products nằm trong config.left và config.right
    return (
      <CategoryTwoRowSection 
        leftColumnData={config?.left}
        rightColumnData={config?.right}
      />
    );
  }

  // === LOGIC CŨ CHO CÁC LOẠI KHÁC (CATEGORY, FLASH_SALE...) ===
  
  // Xử lý styles từ config
  const titleClass = config?.titleSize || 'text-2xl';
  const mobileLayoutClass = config?.mobileLayout === 'scroll' 
    ? 'flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar' // Thêm no-scrollbar cho đẹp
    : config?.mobileLayout === 'grid-2'
    ? 'grid grid-cols-2 gap-2'
    : 'flex flex-col gap-4';

  const renderHeader = () => (
    <div className="flex justify-between items-end mb-4 px-2 md:px-0">
      <div className="flex items-center gap-3">
        <h2 className={`${titleClass} font-bold text-gray-800`}>{title}</h2>
        {type === 'FLASH_SALE' && (
           <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Đang diễn ra</span>
        )}
      </div>
      
      {config?.showPopup && (
        <div className="text-sm text-primary hover:underline cursor-pointer flex items-center">
          Xem tất cả <ChevronRight size={16} />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    let productsToRender = products || [];
    
    if (productsToRender.length === 0) {
      if (type === 'CATEGORY_ROW' && category) {
        productsToRender = category.products || []; 
      } else if (type === 'FLASH_SALE' && promotion) {
        productsToRender = promotion.products || [];
      }
    }

    if (productsToRender.length === 0) return <div className="text-gray-400 text-center py-4">Đang cập nhật sản phẩm...</div>;

    return (
      <div className={`
        ${mobileLayoutClass} 
        md:grid md:gap-4 
        ${config?.layout === 'two-row' ? 'md:grid-cols-5' : 'md:flex md:overflow-auto'}
      `}>
        {productsToRender.map((prod: any) => (
          <div key={prod.id} className="min-w-[150px] md:min-w-0 snap-center">
             <ProductCard product={prod} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="my-6 md:my-8 container mx-auto bg-white p-4 rounded-lg shadow-sm">
      {renderHeader()}
      {renderContent()}
    </section>
  );
}