// src/modules/product/components/ProductCard.tsx
import React, { useRef, useMemo } from "react";
import { useTracking, EventType } from "@/hooks/useTracking";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id?: string;
  image?: string;
  title?: string;
  price?: string | number;
  originalPrice?: string | number;
  
  // --- Updated Props ---
  isDiscountActive?: boolean; // Added
  discountType?: string;      // Added
  discountValue?: number;     // Added
  
  discount?: string;
  tag?: string; 
  sold?: string | number;
  location?: string;
  flashSaleConfig?: {
    stockRemaining: number;
    stockTotal: number;
    endsIn?: string;
  };
  shippingEstimate?: number;
  data?: any; 
}

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

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  price,
  originalPrice,
  discount,
  flashSaleConfig,
  sold,
  shippingEstimate,
  data,
  // Destructure new props
  isDiscountActive: propIsDiscountActive,
  discountType: propDiscountType,
}) => {
  const { track } = useTracking();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const rawId = id || data?.id || data?.slug;
  const rawTitle = title || data?.title || data?.name || "Sản phẩm";
  
  const priceInfo = useMemo(() => {
    // 1. INPUT PARSING
    const pPrice = parsePrice(data?.price);
    const pOriginal = parsePrice(data?.originalPrice);
    const pRegular = parsePrice(data?.regularPrice);
    const propsPrice = parsePrice(price);
    const propsOriginal = parsePrice(originalPrice);

    // BƯỚC 1: Xác định Giá Bán & Giá Gốc Input
    let calcFinal = pPrice > 0 ? pPrice : propsPrice;
    let inputOriginal = pOriginal > 0 ? pOriginal : (pRegular > 0 ? pRegular : propsOriginal);

    if (calcFinal === 0 && inputOriginal > 0) {
        calcFinal = inputOriginal;
        inputOriginal = 0;
    }

    // 2. LOGIC DISCOUNT
    // Fix: Check prop first, then data
    const isDiscountActive = propIsDiscountActive === true || data?.isDiscountActive === true;
    const discountType = propDiscountType || data?.discountType; 
    
    let discountValue = 0;
    // Fix: Robust access to discount value
    const rawDiscount = data?.discountValue; 
    if (rawDiscount) {
        if (discountType === 'PERCENT' && typeof rawDiscount === 'string') {
             const val = parseFloat(rawDiscount);
             discountValue = isNaN(val) ? 0 : val;
        } else {
             discountValue = parsePrice(rawDiscount);
        }
    }

    let calcOriginal = inputOriginal;
    let badge = discount || null;
    let isAmountType = false;

    // BƯỚC 2: Tính toán & Tạo Badge
    if (isDiscountActive) {
        if (calcOriginal <= calcFinal) {
            if (discountType === 'PERCENT' && discountValue > 0 && discountValue < 100) {
                calcOriginal = Math.round(calcFinal / (1 - discountValue / 100));
            } else if (discountType === 'AMOUNT' && discountValue > 0) {
                calcOriginal = calcFinal + discountValue;
            }
        }

        if (discountType === 'PERCENT') {
            badge = `-${Math.round(discountValue)}%`;
        } else if (discountType === 'AMOUNT') {
            badge = `-${formatShortAmount(discountValue)}`;
            isAmountType = true;
        }

    } else {
        if (!badge && data?.discountPercent) {
             badge = `-${data.discountPercent}%`;
             if (calcOriginal === 0 && inputOriginal > calcFinal) {
                 calcOriginal = inputOriginal;
             }
        } else {
             if (calcOriginal <= calcFinal) {
                calcOriginal = 0;
             }
        }
    }

    // BƯỚC 3: Final Safety Checks
    calcFinal = Math.max(0, Math.round(calcFinal));
    calcOriginal = Math.max(0, Math.round(calcOriginal));
    
    if (calcOriginal > 0 && calcFinal >= calcOriginal) {
        calcOriginal = 0;
    }
    
    if (calcFinal === 0) {
        calcOriginal = 0;
        badge = null;
    }

    return {
        finalPriceStr: safeFormatCurrency(calcFinal),
        originalPriceStr: (calcOriginal > 0) ? safeFormatCurrency(calcOriginal) : null,
        badgeText: badge,
        isAmountDiscount: isAmountType
    };
  }, [data, price, originalPrice, discount, rawTitle, propIsDiscountActive, propDiscountType]); // Updated Deps

  const { finalPriceStr, originalPriceStr, badgeText, isAmountDiscount } = priceInfo;

  // Image handling
  let rawImage = image;
  if (!rawImage && data) {
      if (data.imageUrl) rawImage = data.imageUrl;
      else if (data.image) rawImage = data.image;
      else if (Array.isArray(data.images) && data.images.length > 0) rawImage = data.images[0];
  }
  const displayImage = rawImage || "/assets/placeholder.png";
  
  const displaySold = sold || (data?.salesCount || data?.sales ? `Đã bán ${data.salesCount || data.sales}` : null);
  
  const percentSold = flashSaleConfig 
    ? Math.min(100, Math.round(((flashSaleConfig.stockTotal - flashSaleConfig.stockRemaining) / flashSaleConfig.stockTotal) * 100))
    : 0;
  const isAlmostOut = flashSaleConfig && flashSaleConfig.stockRemaining < 5;

  const handleCardClick = () => {
    if (rawId) {
        track(EventType.CLICK_PRODUCT, rawId);
        router.push(`/product-details/${rawId}`); 
    }
  };

  const renderShippingEstimate = () => {
    if (!shippingEstimate) return null;
    const date = new Date(shippingEstimate * 1000);
    if (isNaN(date.getTime())) return null;

    const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
      <div className="absolute bottom-20 left-0 w-full px-2.5 pointer-events-none">
         <div className="bg-green-50/90 backdrop-blur-sm border border-green-200 rounded px-2 py-1 flex items-center gap-1 shadow-sm">
            <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px] text-green-700 font-medium">Giao khoảng {diffDays > 0 ? diffDays : 1} ngày nữa</span>
         </div>
      </div>
    );
  };

  return (
    <div 
      ref={cardRef} 
      className={`group relative flex flex-col bg-white rounded-[4px] overflow-hidden transition-all duration-300 ease-out h-full cursor-pointer select-none
        ${!flashSaleConfig 
          ? 'border border-gray-100 hover:border-brand-orange/30 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]' 
          : 'border border-transparent hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 ring-1 ring-orange-50'}
      `}
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
        <img 
            src={displayImage} 
            alt={rawTitle} 
            loading="lazy" 
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.png" }}
        />
        
        {!flashSaleConfig && renderShippingEstimate()}

        {(badgeText || flashSaleConfig) && (
          <div className={`absolute top-0 right-0 text-[10px] font-bold px-1.5 py-0.5 min-w-[36px] text-center rounded-bl-[4px] shadow-sm z-10
            ${isAmountDiscount 
                ? 'bg-yellow-400 text-red-700' 
                : 'bg-yellow-400 text-red-600'}
          `}>
            <span className="block leading-none mt-0.5">{badgeText || "-%"}</span>
            <span className="block text-[9px] font-semibold uppercase leading-none mt-0.5">
                {isAmountDiscount ? 'GIẢM' : 'SALE'}
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1 bg-white">
        <h3 className="text-xs text-gray-700 font-normal leading-relaxed line-clamp-2 min-h-[32px] mb-2 group-hover:text-orange-700 transition-colors duration-200" title={rawTitle}>
          {rawTitle}
        </h3>

        {flashSaleConfig ? (
             <div className="flex flex-col mt-auto gap-1">
                  <div className="relative w-full h-3.5 bg-orange-100 rounded-[4px] overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-[4px] transition-all duration-500" style={{ width: `${percentSold}%` }}></div>
                  </div>
                   <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isAlmostOut ? 'text-red-600 animate-pulse' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600'}`}>
                        {isAlmostOut ? 'Sắp hết hàng' : `Còn ${flashSaleConfig.stockRemaining} sản phẩm`}
                    </span>
                   </div>
                   <div className="flex items-baseline gap-1 mt-0.5 flex-wrap">
                    <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{finalPriceStr}</span>
                    {originalPriceStr && <span className="text-[10px] text-gray-400 line-through decoration-gray-300 translate-y-[1px]">{originalPriceStr}</span>}
                    </div>
             </div>
        ) : (
             <div className="flex flex-col gap-1 mt-auto">
                <div><span className="border border-brand-orange text-brand-orange text-[9px] px-1 rounded-[2px] bg-orange-50 font-medium">Rẻ Vô Địch</span></div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-base font-bold text-brand-orange">{finalPriceStr}</span>
                  {originalPriceStr && <span className="text-[10px] text-gray-400 line-through truncate decoration-gray-300">{originalPriceStr}</span>}
                </div>
                 <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                    <div className="flex items-center gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-400"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                        <span>{data?.rating || 4.9}</span>
                    </div>
                    <span className="text-gray-400 text-[9px]">{displaySold || 'Đã bán 0'}</span>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;