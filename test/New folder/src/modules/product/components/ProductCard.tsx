// src/modules/product/components/ProductCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { useTracking, EventType } from "@/hooks/useTracking";

interface ProductCardProps {
  id?: string;
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  tag?: string; 
  sold?: string;
  location?: string;
  flashSaleConfig?: {
    stockRemaining: number;
    stockTotal: number;
    endsIn?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  price,
  originalPrice,
  discount,
  tag,
  sold,
  location,
  flashSaleConfig,
}) => {
  const { track } = useTracking();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasViewed, setHasViewed] = useState(false);

  // useEffect(() => {
  //   if (!id || hasViewed) return;
  //   let timer: NodeJS.Timeout;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting) {
  //         timer = setTimeout(() => {
  //             track(EventType.VIEW_PRODUCT, id, { source: 'product_grid' });
  //             setHasViewed(true);
  //             observer.disconnect();
  //         }, 1000);
  //       } else {
  //         if (timer) clearTimeout(timer);
  //       }
  //     },
  //     { threshold: 0.5 }
  //   );
    
  //   if (cardRef.current) observer.observe(cardRef.current);
    
  //   return () => {
  //     observer.disconnect();
  //     if (timer) clearTimeout(timer);
  //   };
  // }, [id, hasViewed, track]);

  const percentSold = flashSaleConfig 
    ? Math.min(100, Math.round(((flashSaleConfig.stockTotal - flashSaleConfig.stockRemaining) / flashSaleConfig.stockTotal) * 100))
    : 0;
  
  const isAlmostOut = flashSaleConfig && flashSaleConfig.stockRemaining < 5;

  return (
    <div 
      ref={cardRef} 
      // Update: rounded-[4px]
      className={`group relative flex flex-col bg-white rounded-[4px] overflow-hidden transition-all duration-300 ease-out h-full cursor-pointer select-none
        ${!flashSaleConfig 
          ? 'border border-gray-100 hover:border-brand-orange/30 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]' 
          : 'border border-transparent hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 ring-1 ring-orange-50'}
      `}
      onClick={() => {
        if (id) track(EventType.CLICK_PRODUCT, id); 
      }}
    >
      {/* 1. Phần Ảnh sản phẩm */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-300" />

        {/* --- Tag Giảm giá --- */}
        {(discount || flashSaleConfig) && (
          // Update: rounded-bl-[4px]
          <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-[10px] font-bold px-1.5 py-0.5 min-w-[36px] text-center rounded-bl-[4px] shadow-sm z-10">
            <span className="block leading-none mt-0.5">{discount || "-50%"}</span>
            <span className="block text-[9px] font-semibold text-white uppercase leading-none mt-0.5">GIẢM</span>
          </div>
        )}

        {/* --- Tag Mall/Yêu thích --- */}
        {tag && !flashSaleConfig && (
          // Update: rounded-r-[4px]
          <div className="absolute top-2 left-[-4px] bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-r-[4px] shadow-md z-10">
            {tag}
            <div className="absolute bottom-[-4px] left-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-brand-orange-dark/80"></div>
          </div>
        )}
        
        {/* --- Sticker Flash Deal --- */}
        {flashSaleConfig && (
           // Update: rounded-br-[4px]
           <div className="absolute top-0 left-0 bg-gradient-to-br from-orange-500 to-red-600 text-white p-1.5 rounded-br-[4px] z-10 shadow-md flex flex-col items-center justify-center min-w-[32px] min-h-[32px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l2.976-7.302H4.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.914-.143z" clipRule="evenodd" />
              </svg>
           </div>
        )}
      </div>

      {/* 2. Phần Thông tin */}
      <div className="p-2.5 flex flex-col flex-1 bg-white">
        
        <h3 
          className="text-xs text-gray-700 font-normal leading-relaxed line-clamp-2 min-h-[32px] mb-2 group-hover:text-orange-700 transition-colors duration-200"
          title={title}
        >
          {title}
        </h3>

        {flashSaleConfig ? (
          <div className="flex flex-col mt-auto gap-1">
            {/* Update: rounded-[4px] cho thanh progress */}
            <div className="relative w-full h-3.5 bg-orange-100 rounded-[4px] overflow-hidden">
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-[4px] transition-all duration-500"
                 style={{ width: `${percentSold}%` }}
               >
                  <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:10px_10px]"></div>
               </div>
            </div>
            
            <div className="flex items-center gap-1 mt-0.5">
               <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1
                 ${isAlmostOut ? 'text-red-600 animate-pulse' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600'}
               `}>
                 {isAlmostOut && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-500">
                      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                    </svg>
                 )}
                 {isAlmostOut ? 'Sắp hết hàng' : `Còn ${flashSaleConfig.stockRemaining} sản phẩm`}
               </span>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                {price}
              </span>
              {originalPrice && (
                 <span className="text-[10px] text-gray-400 line-through decoration-gray-300 translate-y-[1px]">
                   {originalPrice}
                 </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 mt-auto">
            <div>
               <span className="border border-brand-orange text-brand-orange text-[9px] px-1 rounded-[2px] bg-orange-50 font-medium">Rẻ Vô Địch</span>
            </div>
            
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-base font-bold text-brand-orange">{price}</span>
              {originalPrice && (
                <span className="text-[10px] text-gray-400 line-through truncate decoration-gray-300">{originalPrice}</span>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
              <div className="flex items-center gap-0.5">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-400">
                   <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                 </svg>
                 <span>4.9</span>
              </div>
              <span className="text-gray-400 text-[9px]">Đã bán {sold || '100+'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;