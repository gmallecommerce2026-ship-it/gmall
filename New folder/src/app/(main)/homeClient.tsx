"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import HeroCarousel from "@/modules/home/components/HeroCarousel";
import { apiClient } from "@/lib/api/ApiClient"; 
import { HeroRightSidebar } from "@/modules/home/components/HeroRightSidebar";
import ProductCard from "@/modules/product/components/ProductCard";
import SubHeroCarousel from "@/modules/home/components/SubHeroCarousel";
import CategoryMenu from "@/modules/home/components/CategoryMenu";
import CategoryTwoRowSection, { SectionColumnData } from "@/modules/home/components/CategoryTwoRowSection";
import { HERO_SLIDES, SUB_HERO_SLIDES } from "@/modules/home/data/heroData";

// --- HELPERS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const mapApiToUI = (product: any) => {
  if (!product) return null;
  let imageUrl = "/assets/placeholder.png";
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url || firstImg;
  }
  const price = Number(product.price) || 0;
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : (price * 1.2); 

  return {
    id: product.id,
    image: imageUrl,
    title: product.name,
    price: formatCurrency(price),
    originalPrice: originalPrice ? formatCurrency(originalPrice) : undefined,
    sold: product.salesCount > 1000 ? `${(product.salesCount/1000).toFixed(1)}k` : product.salesCount,
    tag: product.salesCount > 1000 ? "Bán chạy" : "Mới",
    discount: originalPrice && originalPrice > price 
      ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`
      : null,
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
  const products = Array.isArray(data) ? data.map(mapApiToUI) : [];
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
          {products.map((p, idx) => (
            <Link href={`/product-details/${p.id}`} key={idx} className="block h-full hover:-translate-y-0.5 transition-transform">
              <ProductCard {...p} tag="Flash Sale" discount={p.discount || "-50%"} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. SMART SECTION (CATEGORY ĐƠN)
const SmartProductSection = ({ title, emoji, headerColor, viewAllLink, productsData = [] }: any) => {
  const products = Array.isArray(productsData) ? productsData.map(mapApiToUI) : [];
  
  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      <div className="bg-white rounded-[4px] p-4 shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <h3 className={`text-xl font-bold uppercase ${headerColor || 'text-gray-800'}`}>{title}</h3>
          </div>
          <Link href={viewAllLink || '#'} className="text-sm text-gray-400 hover:text-brand-orange flex items-center gap-1">
            Xem tất cả <DynamicArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {products.slice(0, 6).map((p: any, idx: number) => (
             <Link href={`/product-details/${p.id}`} key={idx}><ProductCard {...p} /></Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. SPECIAL: TWO ROW SECTION
const DynamicTwoRowLoader = ({ config }: { config: any }) => {
  const [leftData, setLeftData] = useState<any[]>([]);
  const [rightData, setRightData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeft = async () => {
       try {
         const search = config?.left?.filters?.[0] || ''; 
         const res = await apiClient.get('/store/products', { params: { limit: 6, search, sort: 'sales_desc' } });
         // [FIX] Luôn set mảng
         setLeftData(Array.isArray(res?.data) ? res.data : []);
       } catch { setLeftData([]); }
    };
    const fetchRight = async () => {
       try {
         const search = config?.right?.filters?.[0] || '';
         const res = await apiClient.get('/store/products', { params: { limit: 6, search, sort: 'newest' } });
         setRightData(Array.isArray(res?.data) ? res.data : []);
       } catch { setRightData([]); }
    };
    if(config?.left) fetchLeft();
    if(config?.right) fetchRight();
  }, [config]);

  const leftCol: SectionColumnData = {
     title: config?.left?.title || '',
     emoji: config?.left?.emoji,
     headerColor: config?.left?.headerColor,
     products: Array.isArray(leftData) ? leftData.map(mapApiToUI) : [],
     viewAllLink: '/search',
     filters: config?.left?.filters || []
  };

  const rightCol: SectionColumnData = {
     title: config?.right?.title || '',
     emoji: config?.right?.emoji,
     headerColor: config?.right?.headerColor,
     products: Array.isArray(rightData) ? rightData.map(mapApiToUI) : [],
     viewAllLink: '/search',
     filters: config?.right?.filters || []
  };

  if(leftData.length === 0 && rightData.length === 0) return null;

  return <CategoryTwoRowSection leftColumnData={leftCol} rightColumnData={rightCol} />;
};


// --- MAIN PAGE ---
const HomeClient = () => {
  const [dynamicSections, setDynamicSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiClient.get('/home-settings/layout'); 
        // [FIX QUAN TRỌNG]: Kiểm tra type response
        if (Array.isArray(res)) {
            setDynamicSections(res);
        } else if (res && Array.isArray(res.data)) {
            setDynamicSections(res.data);
        } else {
            setDynamicSections([]);
        }
      } catch (error) {
        console.error("Home config load failed:", error);
        setDynamicSections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const renderSection = (section: any) => {
    if (!section || !section.type) return null;

    switch (section.type) {
      case 'FLASH_SALE':
        return <FlashDealSection key={section.id} data={section.voucher?.products || []} />;
      
      case 'CATEGORY_TWO_ROW':
        if (!section.config) return null;
        return <DynamicTwoRowLoader key={section.id} config={section.config} />;
      
      case 'CATEGORY':
      default:
        return (
          <SmartProductSection 
            key={section.id}
            title={section.title}
            emoji={section.config?.emoji}
            productsData={section.category?.products || []} 
            viewAllLink={`/category/${section.category?.slug || '#'}`}
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-20">
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

      {!loading && dynamicSections.length > 0 && dynamicSections.map(renderSection)}

      <div className="w-full max-w-[1340px] mx-auto px-4 mt-8 mb-8">
         <CategoryMenu />
      </div>
    </div>
  );
};

export default HomeClient;