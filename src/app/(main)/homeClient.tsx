"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ProductService } from "@/services/product.service";
import Link from "next/link";
import dynamic from 'next/dynamic';
import HeroCarousel from "@/modules/home/components/HeroCarousel";
import { HeroRightSidebar } from "@/modules/home/components/HeroRightSidebar";
import GiftFinderFilter from "@/modules/home/components/GiftFinderFilter";
import ProductCard from "@/modules/product/components/ProductCard";
import SubHeroCarousel from "@/modules/home/components/SubHeroCarousel";
import CategoryMenu from "@/modules/home/components/CategoryMenu";
import CategoryTwoRowSection, { SectionColumnData } from "@/modules/home/components/CategoryTwoRowSection";
import { HERO_SLIDES, SUB_HERO_SLIDES } from "@/modules/home/data/heroData";
import { Sparkles } from "lucide-react";
import SEOHomeFooter from "@/modules/home/components/SEOHomeFooter";
import { api } from "@/services/api";
import { API_BASE_URL } from "@/lib/api/config";
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

    sold: item.sold > 1000 ? `${(item.sold / 1000).toFixed(1)}k` : item.sold,
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

    sold: product.salesCount > 1000 ? `${(product.salesCount / 1000).toFixed(1)}k` : product.salesCount,
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

// Đồng hồ thật: null ở server → không lệch hydration
const useNow = () => {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const RealCountdown = ({ ms }: { ms: number }) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const parts = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60];
  return (
    <div className="flex items-center gap-1.5">
      {parts.map((v, i) => (
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

const FlashDealSection = ({
  data = [], endTime, startTime, title, emoji,
}: { data?: any[]; endTime?: string; startTime?: string; title?: string; emoji?: string }) => {
  const now = useNow();
  const products = Array.isArray(data) ? data.map(mapApiFDToUI) : [];
  if (products.length === 0) return null;

  const hasRealTime = !!endTime;
  if (hasRealTime) {
    if (now === null) return null; // chờ client mount
    const end = new Date(endTime!).getTime();
    const start = startTime ? new Date(startTime).getTime() : 0;
    if (now >= end || now < start) return null; // hết giờ / chưa tới giờ → ẩn
  }
  const remaining = hasRealTime ? new Date(endTime!).getTime() - (now as number) : 0;

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      <div className="bg-white relative w-full rounded-[4px] p-5 md:p-6 shadow-sm border border-orange-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-gray-100 pb-4 md:pb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10">
            {title ? (
              <h2 className="font-sans text-2xl md:text-[2rem] font-black uppercase tracking-tighter leading-none text-gray-900">
                {emoji || '⚡'} {title}
              </h2>
            ) : (
              <h2 className="font-sans text-3xl md:text-[2.5rem] font-black uppercase tracking-tighter leading-none flex items-end">
                <span className="text-gray-900">FLA</span>
                <span className="text-brand-orange mx-[-1px]">S</span>
                <span className="text-gray-900">H DEAL</span>
              </h2>
            )}
            {!hasRealTime && (
              <div className="flex items-center gap-3">
                <CountdownTimer />
                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">Sale 90%</span>
              </div>
            )}
          </div>

          {/* Góc trên bên phải: đếm ngược thật + Xem tất cả */}
          <div className="flex items-center gap-4 md:ml-auto">
            {hasRealTime && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-bold text-gray-500 uppercase">Kết thúc sau</span>
                <RealCountdown ms={remaining} />
              </div>
            )}
            <Link href="/flash-sale" className="text-gray-500 hover:text-brand-orange font-medium text-sm whitespace-nowrap">Xem tất cả &gt;</Link>
          </div>
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

// Khối Flash Sale do admin cấu hình (config.sessionId)
const FlashSaleSessionBlock = ({ sessionId, title, emoji }: { sessionId: string; title?: string; emoji?: string }) => {
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    let alive = true;
    // fetch thuần: endpoint public, không muốn dính logic redirect-401 của axios/apiClient
    fetch(`${API_BASE_URL}/store/flash-sale/sessions/${sessionId}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!alive) return;
        const s = res?.id ? res : res?.data;
        setSession(s?.id ? s : null);
      })
      .catch(() => { if (alive) setSession(null); });
    return () => { alive = false; };
  }, [sessionId]);

  if (!session) return null;
  return (
    <FlashDealSection
      data={session.products || []}
      endTime={session.endTime}
      startTime={session.startTime}
      title={title}
      emoji={emoji}
    />
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
const mapList = (list: any[]) =>
  list.map(mapApiToUI).filter((p): p is NonNullable<typeof p> => !!p);

// Giữ chip đang chọn + sản phẩm đã lọc cho MỘT cột
function useColumnFilter(col: any) {
  const [activeFilter, setActiveFilter] = useState<string | undefined>();
  const [filtered, setFiltered] = useState<any[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // useMemo để identity ổn định: SectionColumn có effect shuffle phụ thuộc `products`
  const baseProducts = useMemo(() => mapList(col?.products || []), [col?.products]);

  const onFilterSelect = useCallback(
    async (keyword: string) => {
      abortRef.current?.abort();

      // Bấm lại chip đang chọn => bỏ lọc, quay về danh sách gốc
      if (keyword === activeFilter) {
        setActiveFilter(undefined);
        setFiltered(null);
        return;
      }

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setActiveFilter(keyword);

      try {
        const raw = await ProductService.searchByKeyword({
          search: keyword,
          categoryId: col?.categoryId,
          limit: 4, // khối chỉ hiển thị 3 (desktop) / 4 (mobile) sản phẩm
          signal: ctrl.signal,
        });
        if (!ctrl.signal.aborted) setFiltered(mapList(raw));
      } catch {
        if (!ctrl.signal.aborted) setFiltered([]);
      }
    },
    [activeFilter, col?.categoryId],
  );

  return { activeFilter, onFilterSelect, products: filtered ?? baseProducts };
}

const TwoRowSectionWrapper = ({ config }: { config: any }) => {
  // Hooks phải đứng TRƯỚC early return
  const left = useColumnFilter(config?.left);
  const right = useColumnFilter(config?.right);

  if ((config?.left?.products?.length ?? 0) === 0 && (config?.right?.products?.length ?? 0) === 0) {
    return null;
  }

  const buildCol = (side: any, state: ReturnType<typeof useColumnFilter>): SectionColumnData => ({
    title: side?.title || '',
    emoji: side?.emoji,
    headerColor: side?.headerColor,
    products: state.products,
    viewAllLink: side?.categoryId ? `/category/${side.categoryId}` : '/search',
    filters: side?.filters || [],
    activeFilter: state.activeFilter,
    onFilterSelect: state.onFilterSelect,
  });

  return (
    <CategoryTwoRowSection
      leftColumnData={buildCol(config?.left, left)}
      rightColumnData={buildCol(config?.right, right)}
    />
  );
};
// 4. SUGGESTED SECTION
// #18 + #19: "Xem thêm" load thêm SP inline thay vì navigate; ưu tiên SP
// popular (theo soldCount/rating) thay vì SP mới đăng (logic ở BE).
const SuggestedSection = ({ products = [] }: { products: any[] }) => {
  const uiProducts = React.useMemo(
    () => (Array.isArray(products) ? products.map(mapApiToUI).filter(Boolean) : []),
    [products],
  );
  // Hiện 12 SP đầu, click "Xem thêm" thì +12 mỗi lần. Khi đã hết, ẩn nút.
  const PAGE = 12;
  const [visible, setVisible] = React.useState(PAGE);
  const shown = uiProducts.slice(0, visible);
  const hasMore = uiProducts.length > visible;

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
        {shown.map((p, idx) => {
          if (!p) return null;
          return (
            <Link href={`/product-details/${p.id}`} key={p.id ?? idx} className="hover:-translate-y-1 transition-transform duration-200">
              <ProductCard {...p} />
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="px-10 py-3 bg-white border border-gray-300 rounded-full text-gray-600 font-medium hover:border-brand-orange hover:text-brand-orange hover:shadow-md transition-all"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE CLIENT ---
interface HomeClientProps {
  initialSections?: any[];
  suggestedProducts?: any[];
  flashSaleData?: any;
  /** Banner do admin tải lên CMS ở `location=HOMEPAGE`. Xem wiki 0104. */
  heroBanners?: any[];
}

const HomeClient = ({ initialSections = [], suggestedProducts = [], flashSaleData, heroBanners = [] }: HomeClientProps) => {
  const dynamicSections = initialSections;

  // Wiki 0104: banner trang chủ ưu tiên dữ liệu CMS, chỉ lùi về bộ mặc định khi
  // khách CHƯA cấu hình banner nào. Bộ mặc định là ảnh stock Unsplash mang nội dung
  // demo ("Phong Cách Mới 2024", "Công Nghệ Đỉnh Cao") — đúng lúc dựng khung, sai
  // hoàn toàn với gian hàng thật; nó chỉ nên xuất hiện khi không còn gì khác để hiện.
  //
  // KHÔNG map `title`/`description`/`ctaLabel` sang slide: banner CMS là ảnh đã
  // thiết kế sẵn chữ và nút. Trường `title` bên CMS chỉ là NHÃN NỘI BỘ để admin nhận
  // ra banner trong danh sách (dữ liệu thật trên prod là "QT PN") — đem in đè lên ảnh
  // sẽ vừa chồng hai lớp tiêu đề vừa phơi ký hiệu nội bộ ra cho khách xem.
  const heroSlides = React.useMemo(() => {
    const fromCms = (heroBanners || [])
      .filter((b: any) => b && typeof b.src === 'string' && b.src.trim())
      .map((b: any) => ({
        id: b.id,
        src: b.src,
        alt: b.alt || b.title || 'Banner khuyến mãi LoveGifts',
        ctaLink: (b.ctaLink || '').trim() || undefined,
        // Bản thiết kế đặt tiêu đề + nút ở nửa trái; khung hero hẹp hơn ảnh nên
        // cắt canh giữa sẽ ăn mất đúng phần đó.
        objectPosition: 'left center',
      }));
    return fromCms.length > 0 ? fromCms : HERO_SLIDES;
  }, [heroBanners]);

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
        if (section.config?.sessionId) {
          return (
            <FlashSaleSessionBlock
              key={section.id}
              sessionId={section.config.sessionId}
              title={section.title}
              emoji={section.config?.emoji}
            />
          );
        }
        // Khối cũ chưa chọn khung giờ: giữ hành vi cũ
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
                <HeroCarousel slides={heroSlides} autoPlayInterval={4000} />
              </div>
              <SubHeroCarousel slides={SUB_HERO_SLIDES} />
            </div>
            <div className="hidden lg:block w-[324px] shrink-0"><HeroRightSidebar /></div>
          </div>
        </div>
      </div>

      {/* #25 — Gift Finder filter dưới hero banner */}
      <GiftFinderFilter />

      {/* FLASH SALE */}
      <FlashDealSection
        key={flashSaleData?.id}
        data={flashSaleData?.products || []}
        endTime={flashSaleData?.endTime}
        startTime={flashSaleData?.startTime}
      />

      {/* 2. DYNAMIC SECTIONS */}
      {dynamicSections.length > 0 && dynamicSections.map(renderSection)}

      {/* 3. SUGGESTED PRODUCTS */}
      <SuggestedSection products={suggestedProducts} />

      <SEOHomeFooter />
    </div>
  );
};

export default HomeClient;