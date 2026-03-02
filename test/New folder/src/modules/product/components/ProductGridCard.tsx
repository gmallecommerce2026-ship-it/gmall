// src/modules/product/components/ProductGridCard.tsx
import React from "react";
import Link from "next/link";

const ShootingStarIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

type ProductGridCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  
  variant: "flash-sale" | "regular";

  // --- Props cho 'flash-sale' ---
  price?: string; 
  discountPercent?: string; 
  countdown?: {
    hours: string | number;
    minutes: string | number;
    seconds: string | number;
  };
  stockRemaining?: number; 
  stockTotal?: number; 
  
  // --- Props cho 'regular' ---
  regularPrice?: string; 
  smallTag?: string; 
  salesCount?: string; 
  rating?: number; 
  location?: string; 
};

const ProductGridCard = (props: ProductGridCardProps) => {
  const {
    id,
    imageUrl,
    title,
    variant,
    price,
    discountPercent,
    countdown,
    stockRemaining,
    stockTotal = 100, 
    regularPrice,
    smallTag,
    salesCount,
    rating,
    location,
  } = props;

  const progressPercent =
    stockRemaining && stockTotal
      ? Math.max(0, Math.min(100, (stockRemaining / stockTotal) * 100))
      : 0;

  return (
  <Link href={`/product-details/${id}`} key={id} className="block h-full">
    {/* Bỏ max-w-xs để card tự fill grid */}
    <div className="bg-white rounded-sm md:rounded shadow-sm border border-gray-200 overflow-hidden w-full hover:shadow-md hover:border-brand-orange transition-all duration-200 cursor-pointer font-sans h-full flex flex-col group">
      {/* 1. Image Section */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {variant === "flash-sale" && discountPercent && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 font-bold text-xs px-1.5 py-0.5 z-10">
            {discountPercent}
          </div>
        )}
      </div>

      {/* 2. Content Section - Giảm padding xuống p-2 */}
      <div className="p-2 md:p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="font-normal text-xs md:text-sm text-gray-800 line-clamp-2 leading-snug min-h-[2.5em]" title={title}>
          {title}
        </h3>

        {/* --- RENDER KIỂU FLASH SALE --- */}
        {variant === "flash-sale" && (
          <div className="flex flex-col gap-1 mt-auto">
            {countdown && (
              <div className="flex items-center gap-0.5">
                <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-red-600 font-bold text-[10px]">:</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-red-600 font-bold text-[10px]">:</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">
                  {String(countdown.seconds).padStart(2, "0")}
                </span>
              </div>
            )}

            <div className="w-full bg-red-100 rounded-full h-3 relative overflow-hidden mt-0.5">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
              {stockRemaining !== undefined && (
                 <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-semibold tracking-tighter uppercase">
                   Đã bán {stockTotal - stockRemaining}
                 </span>
              )}
            </div>

            <div className="text-brand-orange font-bold text-base md:text-lg leading-none mt-1">
                {price || "Liên hệ"}
            </div>
          </div>
        )}

        {/* --- RENDER KIỂU REGULAR --- */}
        {variant === "regular" && (
          <div className="flex flex-col gap-1 mt-auto">
             {/* Tag nhỏ */}
            {smallTag && (
              <div className="flex">
                <span className="text-[9px] md:text-[10px] border border-brand-orange text-brand-orange px-1 py-[1px] rounded-sm leading-none">
                    {smallTag}
                </span>
              </div>
            )}
            
            <div className="flex items-baseline justify-between mt-1">
                <div className="text-brand-orange font-medium text-sm md:text-base">
                {regularPrice}
                </div>
                 {rating && (
                    <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <ShootingStarIcon className="w-2.5 h-2.5 text-yellow-400" />
                    <span>{rating}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500">
              {location && (
                 <span className="truncate max-w-[50%]">{location}</span>
              )}
              <span>Đã bán {salesCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </Link>
  );
};

export default ProductGridCard;