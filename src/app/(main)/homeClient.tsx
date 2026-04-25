"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import HeroCarousel from "@/modules/home/components/HeroCarousel";
import { HeroRightSidebar } from "@/modules/home/components/HeroRightSidebar";
import ProductCard from "@/modules/product/components/ProductCard";
import SubHeroCarousel from "@/modules/home/components/SubHeroCarousel";
import CategoryMenu from "@/modules/home/components/CategoryMenu";
import CategoryTwoRowSection, { SectionColumnData } from "@/modules/home/components/CategoryTwoRowSection";
import { HERO_SLIDES, SUB_HERO_SLIDES } from "@/modules/home/data/heroData";
import { Sparkles } from "lucide-react"; 
import SEOHomeFooter from "@/modules/home/components/SEOHomeFooter";

// --- HELPERS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const mapApiFDToUI = (item: any) => {
  if (!item) return null;
  // item thường là object wrapper { salePrice, product: {...} }
  const productData = item.product || {};
  
  let imageUrl = "/assets/placeholder.png";
  if (Array.isArray(productData.images) && productData.images.length > 0) {
    const firstImg = productData.images[0];
    imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url || firstImg;
  }
  
  const price = Number(item.salePrice) || 0;
  // Flash Sale thường có originalPrice ở cấp wrapper hoặc trong product
  const originalPrice = item.originalPrice ? Number(item.originalPrice) : Number(productData.originalPrice || 0);

  return {
    id: productData.id,
    image: imageUrl,
    title: productData.name,
    // [QUAN TRỌNG] Truyền các field logic giảm giá
    price: price, // Truyền số để con tính toán nếu cần
    finalPriceStr: formatCurrency(price), // Truyền chuỗi hiển thị sẵn
    originalPrice: originalPrice, 
    
    // [QUAN TRỌNG] Truyền object gốc để ProductCard dùng làm fallback
    product: item, 
    data: item, 

    sold: item.sold > 1000 ? `${(item.sold/1000).toFixed(1)}k` : item.sold,
    tag: "Flash Sale",
    // Giữ logic tính % hiển thị nhanh (fallback)
    discount: originalPrice > price 
      ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`
      : undefined,
  };
};

const mapApiToUI = (product: any) => {
  if (!product) return null;
  
  let imageUrl = "/assets/placeholder.png";
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url || firstImg;
  }
  
  const price = Number(product.price) || 0;
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : 0; 

  return {
    id: product.id,
    image: imageUrl,
    title: product.name,
    
    // [QUAN TRỌNG] Truyền đầy đủ các field raw data cho ProductCard/ProductGridCard
    product: product, // Object gốc
    data: product,    // Alias phòng hờ
    
    price: price,
    originalPrice: originalPrice,
    
    // Các cờ giảm giá từ API
    isDiscountActive: product.isDiscountActive,
    discountType: product.discountType,
    discountValue: product.discountValue,
    
    sold: product.salesCount > 1000 ? `${(product.salesCount/1000).toFixed(1)}k` : product.salesCount,
    tag: product.salesCount > 1000 ? "Bán chạy" : "Mới",
    
    // Fallback string nếu component con không tự tính
    discount: originalPrice > price 
      ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`
      : undefined,
  };
};

const DynamicArrowRight = dynamic(() => import("lucide-react").then((mod) => mod.ArrowRight), { ssr: false });
// --- COMPONENTS ---

// 1. FLASH SALE 
const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 2, m: 15, s: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev; 
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2">
      {[time.h, time.m, time.s].map((v, i) => (
        <React.Fragment key={i}>
           <div className="w-8 h-8 md:w-10 md:h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base shadow-sm">
            {v.toString().padStart(2, '0')}
          </div>
          {i < 2 && <span className="font-bold text-black">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const FlashDealSection = ({ data = [] }: { data?: any[] }) => { 
  const products = Array.isArray(data) ? data.map(mapApiFDToUI) : [];
  if (!products || products.length === 0) return null;
  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      <div className="bg-white relative w-full rounded-[4px] p-5 md:p-6 shadow-sm border border-orange-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-gray-100 pb-4 md:pb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10">
            <h2 className="font-sans text-3xl md:text-[2.5rem] font-black uppercase tracking-tighter leading-none flex items-end">
               <span className="text-gray-900">FLA</span>
               <span className="text-brand-orange mx-[-1px]">S</span>
               <span className="text-gray-900">H DEAL</span>
            </h2>
            <div className="flex items-center gap-3">
              <CountdownTimer />
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">Sale 90%</span>
            </div>
          </div>
          <Link href="/flash-sale" className="text-gray-500 hover:text-brand-orange font-medium text-sm">Xem tất cả &gt;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {products.map((p, idx) => {
            if (!p) return null;
            return (
              <Link href={`/product-details/${p.id}`} key={idx} className="block h-full hover:-translate-y-0.5 transition-transform">
                <ProductCard {...p} tag="Flash Sale" discount={p.discount || "-50%"} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 2. SMART SECTION (CATEGORY/MANUAL ĐƠN)
const SmartProductSection = ({ title, emoji, headerColor, viewAllLink, productsData = [], config }: any) => {
  const products = Array.isArray(productsData) ? productsData.map(mapApiToUI) : [];
  if (products.length === 0) return null;

  const isGrid = config?.mobileLayout === 'grid' || config?.mobileLayout === 'grid-2';
  
  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      <div className="bg-white rounded-[4px] p-4 shadow-sm border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-end mb-4 border-b border-gray-50 pb-2">
          <div className="flex items-center gap-2">
            {emoji && <span className="text-2xl animate-bounce">{emoji}</span>}
            <h3 className={`text-xl md:text-2xl font-bold uppercase ${headerColor || 'text-gray-800'}`}>{title}</h3>
          </div>
          {viewAllLink && (
            <Link href={viewAllLink || '#'} className="text-sm text-gray-400 hover:text-brand-orange flex items-center gap-1 transition-colors">
              Xem thêm <DynamicArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        {/* Content */}
        {isGrid ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((p: any, idx: number) => {
              if (!p) return null;
              return (
                <Link href={`/product-details/${p.id}`} key={idx} className="hover:-translate-y-1 transition-transform duration-200">
                    <ProductCard {...p} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-3 pb-4 -mx-2 px-2 snap-x scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible">
            {products.map((p: any, idx: number) => {
              if (!p) return null;
              return (
                <div key={idx} className="min-w-[160px] snap-center md:min-w-0">
                  <Link href={`/product-details/${p.id}`} className="block h-full">
                      <ProductCard {...p} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. SPECIAL: TWO ROW SECTION WRAPPER (ĐÃ CẬP NHẬT: KHÔNG FETCH NỮA)
const TwoRowSectionWrapper = ({ config }: { config: any }) => {
  // Config bây giờ đã chứa sẵn products (được Backend fetch và populate)
  // config.left.products và config.right.products
  
  const leftRawData = config?.left?.products || [];
  const rightRawData = config?.right?.products || [];

  if (leftRawData.length === 0 && rightRawData.length === 0) return null;

  // Helper map dữ liệu
  const filterValidProducts = (list: any[]) => list.map(mapApiToUI).filter((p): p is NonNullable<typeof p> => p !== undefined && p !== null);

  const leftCol: SectionColumnData = {
     title: config?.left?.title || '',
     emoji: config?.left?.emoji,
     headerColor: config?.left?.headerColor,
     products: filterValidProducts(leftRawData), // Truyền data đã map vào
     viewAllLink: config?.left?.categoryId ? `/category/${config.left.categoryId}` : '/search',
     filters: config?.left?.filters || [] 
  };

  const rightCol: SectionColumnData = {
     title: config?.right?.title || '',
     emoji: config?.right?.emoji,
     headerColor: config?.right?.headerColor,
     products: filterValidProducts(rightRawData), // Truyền data đã map vào
     viewAllLink: config?.right?.categoryId ? `/category/${config.right.categoryId}` : '/search',
     filters: config?.right?.filters || []
  };

  return <CategoryTwoRowSection leftColumnData={leftCol} rightColumnData={rightCol} />;
};

// 4. SUGGESTED SECTION
const SuggestedSection = ({ products = [] }: { products: any[] }) => {
  const uiProducts = Array.isArray(products) ? products.map(mapApiToUI) : [];
  if (uiProducts.length === 0) return null;

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-8 mb-8">
       <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] bg-gray-300 w-12 md:w-20"></div>
          <h2 className="text-xl md:text-2xl font-bold text-brand-orange uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" /> Gợi Ý Hôm Nay
          </h2>
          <div className="h-[1px] bg-gray-300 w-12 md:w-20"></div>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {uiProducts.map((p, idx) => {
            if (!p) return null;
            return (
              <Link href={`/product-details/${p.id}`} key={idx} className="hover:-translate-y-1 transition-transform duration-200">
                  <ProductCard {...p} />
              </Link>
            );
          })}
        </div>
       
       <div className="mt-8 flex justify-center">
          <Link href="/search" className="px-10 py-3 bg-white border border-gray-300 rounded-full text-gray-600 font-medium hover:border-brand-orange hover:text-brand-orange hover:shadow-md transition-all">
             Xem Thêm
          </Link>
       </div>
    </div>
  );
};

// --- MAIN PAGE CLIENT ---
interface HomeClientProps {
  initialSections?: any[];
  suggestedProducts?: any[];
  flashSaleData?: any;
}

const HomeClient = ({ initialSections = [], suggestedProducts = [], flashSaleData }: HomeClientProps) => {
  const dynamicSections = initialSections;

  const renderSection = (section: any) => {
    if (!section || !section.type) return null;

    // 1. Dữ liệu cho khối đơn (CATEGORY)
    const productsToRender = (section.products && section.products.length > 0)
      ? section.products 
      : (section.category?.products || []); 

    const viewAllLink = section.category?.id 
      ? `/category/${section.category.slug || section.category.id}` 
      : (section.config?.sourceType === 'MANUAL' ? '/search' : '#');

    switch (section.type) {
      case 'FLASH_SALE':
        return <FlashDealSection key={section.id} data={section.voucher?.products || []} />;
      
      case 'CATEGORY_TWO_ROW':
        if (!section.config) return null;
        // Dùng wrapper mới (không fetch)
        return <TwoRowSectionWrapper key={section.id} config={section.config} />;
      
      case 'CATEGORY':
      default:
        return (
          <SmartProductSection 
            key={section.id}
            title={section.title}
            emoji={section.config?.emoji}
            productsData={productsToRender} 
            viewAllLink={viewAllLink}
            config={section.config}
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-20">
      {/* 1. HERO AREA */}
      <div className="w-full bg-white relative z-10 mt-3">
        <div className="relative z-10 w-full max-w-[1340px] mx-auto px-4 flex flex-col gap-2">
           <div className="flex flex-col lg:flex-row gap-[6px] w-full">
             <div className="flex flex-col gap-2 w-full lg:flex-1 min-w-0">
               <div className="h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] w-full rounded-[2px] overflow-hidden shadow-sm">
                 <HeroCarousel slides={HERO_SLIDES} autoPlayInterval={4000} />
               </div>
               <SubHeroCarousel slides={SUB_HERO_SLIDES} />
             </div>
             <div className="hidden lg:block w-[324px] shrink-0"><HeroRightSidebar /></div>
           </div>
        </div>
      </div>
  
      {/* FLASH SALE */}
      <FlashDealSection key={flashSaleData?.products?.id} data={flashSaleData?.products || []} />

      {/* 2. DYNAMIC SECTIONS */}
      {dynamicSections.length > 0 && dynamicSections.map(renderSection)}

      {/* 3. SUGGESTED PRODUCTS */}
      <SuggestedSection products={suggestedProducts} />

      <SEOHomeFooter />
    </div>
  );
};

export default HomeClient;