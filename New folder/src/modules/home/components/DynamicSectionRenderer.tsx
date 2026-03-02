'use client';

import Link from 'next/link';
import ProductCard from '@/modules/product/components/ProductCard';
// Import các component có sẵn của bạn
import { ChevronRight } from 'lucide-react'; // Hoặc icon từ thư viện icon của bạn

interface SectionProps {
  data: any; // Dữ liệu từ API getHomeLayout
}

export default function DynamicSectionRenderer({ data }: SectionProps) {
  const { title, type, config, category, promotion } = data;
  
  // Xử lý styles từ config
  const titleClass = config.titleSize || 'text-2xl';
  const mobileLayoutClass = config.mobileLayout === 'scroll' 
    ? 'flex overflow-x-auto gap-4 pb-4 snap-x' // Vuốt ngang
    : config.mobileLayout === 'grid-2'
    ? 'grid grid-cols-2 gap-2' // Lưới 2 cột
    : 'flex flex-col gap-4'; // Stack dọc

  const containerClass = config.layout === 'two-row'
    ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4' // Grid Desktop
    : 'flex gap-4 overflow-hidden'; // Carousel Desktop (đơn giản hóa)

  // Render phần Header của Section (Title + Popup/Link)
  const renderHeader = () => (
    <div className="flex justify-between items-end mb-4 px-2 md:px-0">
      <div className="flex items-center gap-3">
        <h2 className={`${titleClass} font-bold text-gray-800`}>{title}</h2>
        {/* Flash Sale Countdown nếu cần */}
        {type === 'FLASH_SALE' && (
           <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Đang diễn ra</span>
        )}
      </div>
      
      {/* Popup / Sub-links */}
      {config.showPopup && (
        <div className="text-sm text-primary hover:underline cursor-pointer flex items-center">
          Xem tất cả <ChevronRight size={16} />
        </div>
      )}
    </div>
  );

  // Render Nội dung chính
  const renderContent = () => {
    let products = [];
    
    if (type === 'CATEGORY_ROW' && category) {
      // Giả sử category.products được include từ API
      products = category.products || []; 
    } else if (type === 'FLASH_SALE' && promotion) {
      products = promotion.products || [];
    }

    if (products.length === 0) return <div className="text-gray-400">Đang cập nhật sản phẩm...</div>;

    return (
      <div className={`
        ${mobileLayoutClass} 
        md:grid md:gap-4 
        ${config.layout === 'two-row' ? 'md:grid-cols-5' : 'md:flex md:overflow-auto'}
      `}>
        {products.map((prod: any) => (
          <div key={prod.id} className="min-w-[150px] md:min-w-0 snap-center">
             <ProductCard product={prod} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="my-8 container mx-auto bg-white p-4 rounded-lg shadow-sm">
      {renderHeader()}
      {renderContent()}
    </section>
  );
}