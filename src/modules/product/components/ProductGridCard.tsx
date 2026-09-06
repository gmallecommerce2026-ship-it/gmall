// src/modules/product/components/ProductGridCard.tsx
import React, { useMemo } from "react";
import Link from "next/link";

// --- [ICONS] ---
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

// --- [UTILS] ---
const parsePrice = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const strVal = String(value).trim();
  if (strVal === "") return 0;
  const cleanStr = strVal.replace(/[^0-9]/g, '');
  const num = Number(cleanStr);
  return isNaN(num) ? 0 : num;
};

const safeFormatCurrency = (value: number) => {
  if (value <= 0) return "Liên hệ";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatShortAmount = (value: number) => {
  if (value >= 1000) return `${Math.floor(value / 1000)}k`;
  return value;
};

type ProductGridCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  variant: "flash-sale" | "regular";
  
  // Các field quan trọng cần debug
  price?: string | number; 
  regularPrice?: string | number; 
  originalPrice?: string | number; 
  isDiscountActive?: boolean;
  discountType?: string;
  discountValue?: string | number;
  discountPercent?: string; 
  
  countdown?: {
    hours: string | number;
    minutes: string | number;
    seconds: string | number;
  };
  stockRemaining?: number; 
  stockTotal?: number; 
  smallTag?: string; 
  salesCount?: string | number; 
  rating?: number; 
  location?: string;
  product?: any; // Dữ liệu thô từ API thường nằm ở đây
};

const ProductGridCard = (props: ProductGridCardProps) => {
  const { id, imageUrl, title, variant, product } = props;

  // Wiki 0104: gỡ khối debug log. Ngoài việc đổ rác ra console của khách, nó còn
  // SAI cân bằng: `console.group()` gọi ngoài useMemo (mỗi lần render) nhưng
  // `console.groupEnd()` lại nằm trong useMemo (chỉ chạy khi deps đổi) → nhóm mở
  // mà không đóng, lồng sâu dần; và log giữ tham chiếu tới nguyên object sản phẩm
  // nên chặn thu hồi bộ nhớ trên trang có hàng chục thẻ.
  const priceInfo = useMemo(() => {
    // 1. RAW DATA & PARSE
    const pPrice = parsePrice(product?.price);
    const pOriginal = parsePrice(product?.originalPrice);
    const pRegular = parsePrice(product?.regularPrice);
    
    const propsPrice = parsePrice(props.price);
    const propsOriginal = parsePrice(props.originalPrice);
    const propsRegular = parsePrice(props.regularPrice);

    // BƯỚC 1: Xác định GIÁ BÁN (FinalPrice)
    let finalPrice = pPrice > 0 ? pPrice : propsPrice;

    // BƯỚC 2: Xác định GIÁ GỐC
    // Ưu tiên: pOriginal -> propsOriginal -> pRegular -> propsRegular
    let inputOriginalPrice = 0;
    if (pOriginal > 0) inputOriginalPrice = pOriginal;
    else if (propsOriginal > 0) inputOriginalPrice = propsOriginal;
    else if (pRegular > 0) inputOriginalPrice = pRegular;
    else if (propsRegular > 0) inputOriginalPrice = propsRegular;

    // [Safety Fallback]
    if (finalPrice === 0 && inputOriginalPrice > 0) {
        finalPrice = inputOriginalPrice;
        inputOriginalPrice = 0; 
    }

    // BƯỚC 3: LOGIC DISCOUNT
    const isDiscountActive = (props.isDiscountActive === true) || (product?.isDiscountActive === true);
    const discountType = props.discountType || product?.discountType; 
    
    let discountValue = 0;
    const rawDiscountVal = props.discountValue ?? product?.discountValue;
    
    if (discountType === 'PERCENT' && typeof rawDiscountVal === 'string') {
        const val = parseFloat(rawDiscountVal);
        discountValue = isNaN(val) ? 0 : val;
    } else {
        discountValue = parsePrice(rawDiscountVal);
    }

    let calculatedOriginalPrice = inputOriginalPrice;
    let displayBadge = "";
    let isAmountDiscount = false;
    let discountAmountSaved = 0;

    if (isDiscountActive) {
        // Reverse calculation (Tính ngược giá gốc nếu bị thiếu)
        if (calculatedOriginalPrice <= finalPrice) {
            if (discountType === 'PERCENT' && discountValue > 0 && discountValue < 100) {
                calculatedOriginalPrice = Math.round(finalPrice / (1 - discountValue / 100));
            } else if (discountType === 'AMOUNT' && discountValue > 0) {
                calculatedOriginalPrice = finalPrice + discountValue;
            }
        }

        if (discountType === 'PERCENT') {
            displayBadge = `-${Math.round(discountValue)}%`;
        } else if (discountType === 'AMOUNT') {
            displayBadge = `-${formatShortAmount(discountValue)}`;
            isAmountDiscount = true;
            discountAmountSaved = discountValue;
        }

    } else {
        // Fallback props manual
        if (props.discountPercent) {
             displayBadge = props.discountPercent.startsWith('-') ? props.discountPercent : `-${props.discountPercent}`;
             if (calculatedOriginalPrice === 0 && inputOriginalPrice > finalPrice) {
                 calculatedOriginalPrice = inputOriginalPrice;
             }
        } else {
             if (calculatedOriginalPrice <= finalPrice) {
                calculatedOriginalPrice = 0;
             }
        }
    }

    finalPrice = Math.max(0, Math.round(finalPrice));
    calculatedOriginalPrice = Math.max(0, Math.round(calculatedOriginalPrice));
    
    if (calculatedOriginalPrice > 0 && finalPrice >= calculatedOriginalPrice) {
        calculatedOriginalPrice = 0;
    }

    return {
      finalPriceStr: safeFormatCurrency(finalPrice),
      originalPriceStr: (calculatedOriginalPrice > 0) ? safeFormatCurrency(calculatedOriginalPrice) : null,
      badgeText: displayBadge,
      isAmountDiscount,
      discountAmountSaved,
    };
  }, [product, props]); 

  const { finalPriceStr, originalPriceStr, badgeText, isAmountDiscount, discountAmountSaved } = priceInfo;

  const stockRemaining = typeof props.stockRemaining === 'number' ? props.stockRemaining : 0;
  const stockTotal = props.stockTotal || 100;
  const soldCount = Math.max(0, stockTotal - stockRemaining);
  const progressPercent = stockTotal > 0 
      ? Math.max(0, Math.min(100, (stockRemaining / stockTotal) * 100))
      : 0;

  return (
    <Link href={`/product-details/${id}`} className="block h-full group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full hover:shadow-md hover:border-brand-orange transition-all duration-200 cursor-pointer h-full flex flex-col relative">
        
        {(badgeText || variant === "flash-sale") && (
          <div className={`absolute top-0 right-0 z-10 px-2 py-1 text-[10px] font-bold rounded-bl-lg shadow-sm
              ${isAmountDiscount 
                  ? 'bg-yellow-400 text-red-700' 
                  : 'bg-red-600 text-white'
              }
          `}>
            {badgeText || (variant === "flash-sale" ? "HOT" : "")}
          </div>
        )}

        <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
          <img
            src={imageUrl || "/assets/placeholder.png"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.png" }}
          />
        </div>

        <div className="p-2 md:p-2.5 flex flex-col gap-1.5 flex-1">
          <h3 className="font-normal text-xs md:text-sm text-gray-800 line-clamp-2 leading-snug min-h-[2.5em] group-hover:text-brand-orange transition-colors" title={title}>
            {title}
          </h3>

          {variant === "flash-sale" && (
            <div className="flex flex-col gap-1 mt-auto">
              {props.countdown && (
                <div className="flex items-center gap-0.5">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">{String(props.countdown.hours).padStart(2, "0")}</span>
                  <span className="text-red-600 font-bold text-[10px]">:</span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">{String(props.countdown.minutes).padStart(2, "0")}</span>
                  <span className="text-red-600 font-bold text-[10px]">:</span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">{String(props.countdown.seconds).padStart(2, "0")}</span>
                </div>
              )}

              <div className="w-full bg-red-100 rounded-full h-3 relative overflow-hidden mt-0.5">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-semibold tracking-tighter uppercase">
                    Đã bán {soldCount}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-1 flex-wrap">
                  <div className="text-brand-orange font-bold text-base md:text-lg leading-none">
                      {finalPriceStr}
                  </div>
                  {originalPriceStr && (
                      <div className="text-gray-400 text-[10px] line-through">
                          {originalPriceStr}
                      </div>
                  )}
              </div>
            </div>
          )}

          {variant === "regular" && (
            <div className="flex flex-col gap-1 mt-auto">
              {props.smallTag && (
                <div className="flex">
                  <span className="text-[9px] md:text-[10px] border border-brand-orange text-brand-orange px-1 py-[1px] rounded-sm leading-none">
                      {props.smallTag}
                  </span>
                </div>
              )}
              
              <div className="mt-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-brand-orange font-bold text-sm md:text-base">
                        {finalPriceStr}
                      </span>
                      {originalPriceStr && (
                        <span className="text-xs text-gray-400 line-through decoration-gray-300">
                            {originalPriceStr}
                        </span>
                      )}
                  </div>
                  
                  {isAmountDiscount && discountAmountSaved > 0 && (
                      <div className="text-[10px] text-green-600 italic">
                          Tiết kiệm {formatShortAmount(discountAmountSaved)}
                      </div>
                  )}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1 border-t border-gray-50 pt-1">
                <div className="flex items-center gap-0.5">
                    {props.rating ? (
                        <>
                          <ShootingStarIcon className="w-2.5 h-2.5 text-yellow-400" />
                          <span>{props.rating}</span>
                        </>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {props.location && <span className="truncate max-w-[60px]">{props.location}</span>}
                  <span>Đã bán {props.salesCount || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductGridCard;