"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import HeroCarousel from "@/modules/home/components/HeroCarousel";
import { apiClient } from "@/lib/api/ApiClient"; 
import { CategoryNavBar } from "@/modules/home/components/CategoryNavBar"; 
import { HeroRightSidebar } from "@/modules/home/components/HeroRightSidebar";
import { GiftSearchSection } from "@/modules/home/components/GiftSearchSection";
import ProductCard from "@/modules/product/components/ProductCard";
import SubHeroCarousel from "@/modules/home/components/SubHeroCarousel";
import CategoryMenu from "@/modules/home/components/CategoryMenu";
import CategoryTwoRowSection, { SectionColumnData } from "@/modules/home/components/CategoryTwoRowSection";
import FilterChipCarousel from "@/modules/home/components/FilterChipCarousel"; 
import { HERO_SLIDES, SUB_HERO_SLIDES } from "@/modules/home/data/heroData";
import Button from "@/components/ui/Button"; 

interface HomeClientProps {
  initialData?: {
    flashDealData: any[];
    electronicsData: any[];
    beautyData: any[];
  };
}

// --- 1. DỮ LIỆU DANH MỤC CẤP 2 (SUB-CATEGORIES) ---
const SUB_CATEGORY_DATA: Record<string, string[]> = {
  "THỜI TRANG NỮ": ["Áo Thun Nữ", "Váy Đầm", "Quần Jeans", "Áo Khoác", "Đồ Ngủ", "Chân Váy", "Túi Xách"],
  "ĐỒ ĐIỆN TỬ": ["Điện Thoại", "Laptop", "Tai Nghe", "Loa Bluetooth", "Ốp Lưng", "Cáp Sạc", "Pin Dự Phòng"],
  "SẮC ĐẸP": ["Son Môi", "Kem Dưỡng", "Sữa Rửa Mặt", "Nước Hoa", "Trang Điểm", "Dầu Gội", "Mặt Nạ"],
  "BÁCH HÓA ONLINE": ["Bánh Kẹo", "Đồ Ăn Vặt", "Sữa", "Mì Gói", "Gia Vị", "Nước Ngọt"],
  "QUÀ HANDMADE": ["Len Sợi", "Móc Khóa", "Thiệp", "Tô Tượng", "Hoa Len", "Tranh Đính Đá"],
  "QUÀ CAO CẤP": ["Set Quà Tặng", "Yến Sào", "Nhân Sâm", "Rượu Vang", "Trang Sức"],
  "BÁN CHẠY": ["Điện Tử", "Thời Trang", "Gia Dụng", "Mẹ & Bé", "Sách", "Thể Thao"],
  "SẢN PHẨM MỚI": ["Quần Áo", "Phụ Kiện", "Tech", "Decor", "Mỹ Phẩm"]
};

// --- 2. CẤU HÌNH SECTION ---
type SectionType = 'HERO_BANNER' | 'FLASH_SALE' | 'CATEGORY_TWO_ROW' | 'SMART_PRODUCT' | 'RECOMMENDED';

interface SectionConfig {
  id: string;
  type: SectionType;
  order: number;
  config: any; 
}

const MOCK_PAGE_CONFIG: SectionConfig[] = [
  { id: '1', type: 'HERO_BANNER', order: 1, config: {} },
  { id: '2', type: 'FLASH_SALE', order: 2, config: { searchQuery: "" } },
  {
    id: '3', type: 'CATEGORY_TWO_ROW', order: 3,
    config: {
      left: { 
        title: "Bán chạy nhất", emoji: "🔥", headerColor: "text-orange-600", 
        querySort: "sales_desc", link: "/search?sort=sales_desc",
        filters: SUB_CATEGORY_DATA["BÁN CHẠY"] 
      },
      right: { 
        title: "Sản phẩm mới", emoji: "🔔", headerColor: "text-green-600", 
        querySort: "newest", link: "/search?sort=newest",
        filters: SUB_CATEGORY_DATA["SẢN PHẨM MỚI"]
      }
    }
  },
  { 
    id: '4', type: 'SMART_PRODUCT', order: 4, 
    config: { 
      title: "THỜI TRANG NỮ", emoji: "👗", /*searchQuery: "THỜI TRANG NỮ"*/querySort: "sales_desc", headerColor: "text-pink-600",
      filters: SUB_CATEGORY_DATA["THỜI TRANG NỮ"]
    } 
  },
  {
    id: '5', type: 'CATEGORY_TWO_ROW', order: 5,
    config: {
      left: { 
        title: "Quà Handmade", emoji: "🧶", headerColor: "text-pink-300", 
       /*searchQuery: "Quà cao cấp"*/ querySort: "sales_desc", link: "/search?sort=sales_desc",
     //   filters: SUB_CATEGORY_DATA["QUÀ HANDMADE"]
      },
      right: { 
        title: "Quà Cao Cấp", emoji: "⚜️", headerColor: "text-orange-600", 
        /*searchQuery: "Quà cao cấp"*/ querySort: "newest", link: "/search?sort=newest",
       // filters: SUB_CATEGORY_DATA["QUÀ CAO CẤP"]
      }
    }
  },
  {
    id: '6', type: 'CATEGORY_TWO_ROW', order: 5,
    config: {
      left: { 
        title: "Quà Tình Thương", emoji: "🫶", headerColor: "text-pink-300", 
       /*searchQuery: "Quà cao cấp"*/ querySort: "sales_desc", link: "/search?sort=sales_desc",
     //   filters: SUB_CATEGORY_DATA["QUÀ HANDMADE"]
      },
      right: { 
        title: "Sản phẩm của người khuyết tật", emoji: "♿", headerColor: "text-orange-600", 
        /*searchQuery: "Quà cao cấp"*/ querySort: "newest", link: "/search?sort=newest",
       // filters: SUB_CATEGORY_DATA["QUÀ CAO CẤP"]
      }
    }
  },
  { id: '7', type: 'SMART_PRODUCT', order: 6, config: { title: "ĐỒ ĐIỆN TỬ", emoji: "🎧", /*searchQuery: "THỜI TRANG NỮ"*/querySort: "sales_desc", headerColor: "text-blue-600", filters: SUB_CATEGORY_DATA["ĐỒ ĐIỆN TỬ"] } },
  { id: '8', type: 'SMART_PRODUCT', order: 7, config: { title: "SẮC ĐẸP", emoji: "💄", /*searchQuery: "THỜI TRANG NỮ"*/querySort: "sales_desc", headerColor: "text-rose-500", filters: SUB_CATEGORY_DATA["SẮC ĐẸP"] } },
  { id: '9', type: 'SMART_PRODUCT', order: 8, config: { title: "BÁCH HÓA ONLINE", emoji: "🍪", /*searchQuery: "THỜI TRANG NỮ"*/querySort: "sales_desc", headerColor: "text-green-600", filters: SUB_CATEGORY_DATA["BÁCH HÓA ONLINE"] } },
  { id: '10', type: 'RECOMMENDED', order: 9, config: {} }
];

const DynamicArrowRight = dynamic(
  () => import("lucide-react").then((mod) => mod.ArrowRight),
  { ssr: false }
);

// --- HELPER FORMAT TIỀN TỆ ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// --- 3. MAPPER ---
const mapApiToUI = (product: any) => {
  let imageUrl = "/assets/placeholder.png";
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url || firstImg;
  }
  
  const price = Number(product.price) || 0;
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

  return {
    id: product.id,
    image: imageUrl,
    title: product.name,
    price: formatCurrency(price), // Đã format sang chuỗi (VD: "100.000 ₫")
    originalPrice: originalPrice ? formatCurrency(originalPrice) : undefined, // Thêm originalPrice đã format
    sold: product.salesCount > 1000 ? `${(product.salesCount/1000).toFixed(1)}k` : product.salesCount,
    tag: product.salesCount > 1000 ? "Bán chạy" : "Mới",
    discount: originalPrice && originalPrice > price 
      ? `-${Math.round(((originalPrice - price) / originalPrice) * 100)}%`
      : null,
  };
};

// [KHÔI PHỤC] Kích thước Timer to hơn (w-8/w-10) để hợp với Title
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
  const CircleBox = ({ value }: { value: number }) => (
    <div className="w-8 h-8 md:w-10 md:h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base shadow-sm">
      {value.toString().padStart(2, '0')}
    </div>
  );
  return (
    <div className="flex items-center gap-2">
      <CircleBox value={time.h} />
      <span className="font-bold text-black">:</span>
      <CircleBox value={time.m} />
      <span className="font-bold text-black">:</span>
      <CircleBox value={time.s} />
    </div>
  );
};

// === COMPONENT: FLASH DEAL ===
const FlashDealSection = ({ searchQuery = "", data }: { searchQuery?: string, data?: any[] }) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // ✅ NẾU CÓ DATA TỪ SERVER -> DÙNG LUÔN (Nhanh tức thì)
    if (data && data.length > 0) {
      setProducts(data.map(mapApiToUI));
      return;
    }

    // Nếu không có data (fallback) mới gọi API
    apiClient.get('/store/products', { /* params cũ */ })
      .then(res => setProducts(res.data?.map(mapApiToUI) || []))
      .catch(() => {});
  }, [searchQuery, data]);

  if (products.length === 0) return null;

  return (
    // Vẫn giữ mt-3 (compact)
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      {/* Tăng nhẹ padding lên p-5 md:p-6 để title không bị chật */}
      <div className="bg-white relative w-full rounded-[4px] p-5 md:p-6 shadow-sm border border-orange-100">
        
        {/* [KHÔI PHỤC] Header gốc với style FLA-S-H DEAL & Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-gray-100 pb-4 md:pb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10">
            <div className="relative flex items-end"> 
              <h2 className="font-sans text-3xl md:text-[2.5rem] font-black tracking-tighter uppercase flex items-end leading-none">
                <span className="bg-clip-text pb-1 text-gray-900">FLA</span>
                <div className="relative mx-[-1px] md:mx-[-2px] z-10 flex items-end text-brand-orange">S</div>
                <span className="bg-clip-text pb-1 text-gray-900">H DEAL</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 lg:pb-3">
              <CountdownTimer />
              <div className="flex items-center gap-1 bg-orange-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm">
                <span className="uppercase tracking-wide">Sale 90%</span>
              </div>
            </div>
          </div>
          <Link href="/product" className="group flex-shrink-0 flex items-center gap-1 text-gray-500 hover:text-brand-orange font-medium transition-colors text-sm md:text-base mb-2">
            <span>Xem tất cả</span>
          </Link>
        </div>
        
        {/* Vẫn giữ grid gap-2 (compact) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {products.map((props, idx) => (
            <Link href={`/product-details/${props.id}`} key={props.id || idx} className="block h-full transition-transform hover:-translate-y-0.5 duration-200">
              <ProductCard
                id={props.id} image={props.image} title={props.title} price={props.price} sold={props.sold}
                tag="Flash Sale" discount="-90%" location="Hà Nội"
                flashSaleConfig={{ stockRemaining: 5, stockTotal: 100 }}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// === COMPONENT: SMART PRODUCT SECTION ===
interface SmartProductSectionProps {
  title: string; emoji?: string; headerColor?: string; viewAllLink?: string; searchQuery?: string; 
  className?: string; filters?: string[];
}

const SmartProductSection = ({
  title, emoji, headerColor = "text-brand-dark-green", viewAllLink = "/product", searchQuery = "", 
  className = "bg-white", filters = []
}: SmartProductSectionProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>(""); 

  useEffect(() => {
    const query = activeFilter || searchQuery;
    apiClient.get('/store/products', { params: { limit: 12, search: query, page: 1 } })
      .then(res => setProducts(res.data?.map(mapApiToUI) || []))
      .catch(() => {});
  }, [searchQuery, activeFilter]);

  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3">
      <div className={`${className} relative w-full rounded-[4px] p-3 md:p-4 shadow-sm border border-gray-100 flex flex-col group/container`}>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 min-h-[36px]">
          <div className="flex items-center gap-2 shrink-0">
            {emoji && <span className="text-xl md:text-2xl">{emoji}</span>}
            <h3 className={`text-lg md:text-xl font-bold uppercase tracking-wide flex items-center gap-2 ${headerColor}`}>
              {title}
            </h3>
          </div>

          {filters && filters.length > 0 && (
            <div className="flex-1 w-full md:w-auto overflow-hidden">
               <FilterChipCarousel 
                  items={filters}
                  selectedItem={activeFilter}
                  onSelect={(item) => setActiveFilter(item === activeFilter ? "" : item)}
               />
            </div>
          )}

          <Link href={viewAllLink} className="shrink-0 group/link flex items-center gap-1 text-xs md:text-sm font-medium text-gray-400 hover:text-brand-orange transition-colors hidden md:flex">
            <span>Xem tất cả</span>
            <DynamicArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {products.slice(0, 6).map((props, idx) => (
            <Link href={`/product-details/${props.id}`} key={props.id || idx} className="block h-full">
              <ProductCard {...props} location="Hà Nội" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// === COMPONENT: DYNAMIC CATEGORY TWO ROW ===
const DynamicCategoryTwoRow = ({ config }: { config: any }) => {
  const [leftData, setLeftData] = useState<any[]>([]);
  const [rightData, setRightData] = useState<any[]>([]);
  
  const [leftFilter, setLeftFilter] = useState("");
  const [rightFilter, setRightFilter] = useState("");

  useEffect(() => {
    const params: any = { limit: 6 };
    if (config.left.querySort) params.sort = config.left.querySort;
    params.search = leftFilter || config.left.searchQuery; 
    apiClient.get('/store/products', { params }).then(res => setLeftData(res.data?.map(mapApiToUI) || []));
  }, [config.left, leftFilter]);

  useEffect(() => {
    const params: any = { limit: 6 };
    if (config.right.querySort) params.sort = config.right.querySort;
    params.search = rightFilter || config.right.searchQuery;
    apiClient.get('/store/products', { params }).then(res => setRightData(res.data?.map(mapApiToUI) || []));
  }, [config.right, rightFilter]);

  const leftColumn: SectionColumnData = {
    title: config.left.title, 
    emoji: config.left.emoji, 
    headerColor: config.left.headerColor,
    viewAllLink: config.left.link, 
    products: leftData, 
    filters: config.left.filters || [], 
    activeFilter: leftFilter, // <-- THÊM DÒNG NÀY
    onFilterSelect: (item: string) => setLeftFilter(prev => prev === item ? "" : item)
  };

  const rightColumn: SectionColumnData = {
    title: config.right.title, 
    emoji: config.right.emoji, 
    headerColor: config.right.headerColor,
    viewAllLink: config.right.link, 
    products: rightData, 
    filters: config.right.filters || [],
    activeFilter: rightFilter, // <-- THÊM DÒNG NÀY
    onFilterSelect: (item: string) => setRightFilter(prev => prev === item ? "" : item)
  };

  return <CategoryTwoRowSection leftColumnData={leftColumn} rightColumnData={rightColumn} />;
};

// === RECOMMENDED & LOVE GIFTS ===
const RecommendedSection = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    try {
      const res = await apiClient.get('/store/products', { params: { limit: 12, page: page + 1 } });
      if (res?.data && res.data.length > 0) {
        setProducts(prev => [...prev, ...res.data.map(mapApiToUI)]);
        setPage(prev => prev + 1);
      } else setHasMore(false);
    } catch { setHasMore(false); }
  };
  useEffect(() => {
    apiClient.get('/store/products', { params: { limit: 12, page: 1 } }).then(res => setProducts(res.data?.map(mapApiToUI) || []));
  }, []);
  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3 mb-10">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 -z-10 w-1/2 mx-auto"></div>
        <div className="bg-gray-50 px-6 py-1 rounded-full"><h2 className="text-xl md:text-2xl font-bold uppercase text-brand-orange tracking-wider text-center">GỢI Ý HÔM NAY</h2></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {products.map((item, idx) => (<Link href={`/product-details/${item.id}`} key={`${item.id}-${idx}`} className="block h-full"><ProductCard {...item} location="Toàn Quốc" /></Link>))}
      </div>
      {hasMore && (<div className="flex justify-center mt-6"><Button onClick={loadMore} variant="secondary" className="px-10 py-2 bg-white border border-gray-300 rounded-[4px] hover:border-brand-orange hover:text-brand-orange text-gray-600 shadow-sm text-sm">Xem thêm</Button></div>)}
    </div>
  );
};

const ServiceFeaturesSection = () => {
    const features = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="m9 12 2 2 4-4"/>
                </svg>
            ),
            title: "Thương hiệu đảm bảo",
            desc: "Nhập khẩu, bảo hành chính hãng"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                </svg>
            ),
            title: "Đổi trả dễ dàng",
            desc: "Theo chính sách đổi trả tại Gmall"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="3" rx="2"/>
                    <line x1="8" x2="16" y1="21" y2="21"/>
                    <line x1="12" x2="12" y1="17" y2="21"/>
                    <path d="M10 9 8 12l2 3"/>
                    <path d="M14 9l2 3-2 3"/>
                </svg>
            ),
            title: "Giao hàng tận nơi",
            desc: "Trên toàn quốc"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            ),
            title: "Sản phẩm chất lượng",
            desc: "Cam kết 100% chính hãng"
        }
    ];

    return (
        <div className="w-full max-w-[1340px] mx-auto px-4 mt-3 mb-3">
            <div className="bg-white rounded-[4px] p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 justify-center lg:justify-start">
                        {/* Icon Box */}
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange shrink-0">
                            {item.icon}
                        </div>
                        {/* Text */}
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm uppercase">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LoveGiftsSection = () => {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-3 mb-8">
      <div className="bg-white rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] py-6 px-4 md:px-8 border border-gray-100">
        <div className="flex flex-col items-center gap-3 text-center">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-1">G-MALL – TRAO QUÀ YÊU THƯƠNG, LAN TỎA HẠNH PHÚC</h3>
          <div className={`relative w-full font-sans text-sm text-gray-700 font-light leading-relaxed text-justify sm:text-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${isAboutExpanded ? 'max-h-[2500px]' : 'max-h-[100px]'}`}>
             <div className="space-y-3 pb-3"><p><span className="font-bold text-brand-orange">G-MALL</span> là sáng kiến tiên phong tích hợp hoạt động thiện nguyện...</p><p>Điểm khác biệt cốt lõi của G-mall nằm ở sự <span className="font-bold text-gray-900">minh bạch hóa nguồn vốn từ thiện</span>...</p><p>Điểm khác biệt cốt lõi của G-mall nằm ở sự <span className="font-bold text-gray-900">minh bạch hóa nguồn vốn từ thiện</span>...</p><p>Điểm khác biệt cốt lõi của G-mall nằm ở sự <span className="font-bold text-gray-900">minh bạch hóa nguồn vốn từ thiện</span>...</p><p>Điểm khác biệt cốt lõi của G-mall nằm ở sự <span className="font-bold text-gray-900">minh bạch hóa nguồn vốn từ thiện</span>...</p><p>Điểm khác biệt cốt lõi của G-mall nằm ở sự <span className="font-bold text-gray-900">minh bạch hóa nguồn vốn từ thiện</span>...</p><p>Điểm khác biệt cốt lõi của G-mall nằm ở sự <span className="font-bold text-gray-900">minh bạch hóa nguồn vốn từ thiện</span>...</p></div>
             <div className={`absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none transition-opacity duration-300 ${isAboutExpanded ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
          <button onClick={() => setIsAboutExpanded(!isAboutExpanded)} className="group flex items-center gap-1.5 px-5 py-1.5 mt-1 bg-white border border-brand-orange/50 text-brand-orange rounded-[4px] hover:bg-brand-orange hover:text-white transition-all duration-300 focus:outline-none">
            <span className="text-xs font-bold">{isAboutExpanded ? "Thu gọn" : "Xem thêm"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// === SECTION RENDERER ===
// const SectionRenderer = ({ section }: { section: SectionConfig }) => {
//   switch (section.type) {
//     case 'HERO_BANNER':
//       return (
//         <div className="w-full bg-white relative z-10 mt-3">
//           <div className="relative z-10 w-full max-w-[1340px] mx-auto px-4 flex flex-col gap-2">
//             <div className="flex flex-col lg:flex-row gap-[6px] w-full"><div className="flex flex-col gap-2 w-full lg:flex-1 min-w-0"><div className="h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] w-full rounded-[2px] overflow-hidden shadow-sm"><HeroCarousel slides={HERO_SLIDES} autoPlayInterval={4000} /></div><SubHeroCarousel slides={SUB_HERO_SLIDES} /></div><div className="relative w-full lg:w-[324px] flex-shrink-0 hidden lg:block"><HeroRightSidebar /></div></div>
//           </div>
//         </div>
//       );
//     case 'FLASH_SALE': return <FlashDealSection {...section.config} />;
//     case 'SMART_PRODUCT': return <SmartProductSection {...section.config} />;
//     case 'CATEGORY_TWO_ROW': return <DynamicCategoryTwoRow config={section.config} />;
//     case 'RECOMMENDED': return <RecommendedSection />;
//     default: return null;
//   }
// };



const HomeClient = ({ initialData }: HomeClientProps) => {
  const [sections] = useState<SectionConfig[]>(MOCK_PAGE_CONFIG);

  
const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'HERO_BANNER':
         return <div className="w-full bg-white relative z-10 mt-3">
                  <div className="relative z-10 w-full max-w-[1340px] mx-auto px-4 flex flex-col gap-2">
                    <div className="flex flex-col lg:flex-row gap-[6px] w-full"><div className="flex flex-col gap-2 w-full lg:flex-1 min-w-0"><div className="h-[180px] sm:h-[240px] md:h-[300px] lg:h-[350px] w-full rounded-[2px] overflow-hidden shadow-sm"><HeroCarousel slides={HERO_SLIDES} autoPlayInterval={4000} /></div><SubHeroCarousel slides={SUB_HERO_SLIDES} /></div><div className="relative w-full lg:w-[324px] flex-shrink-0 hidden lg:block"><HeroRightSidebar /></div></div>
                  </div>
                </div>; 
         
      case 'FLASH_SALE':
         // ✅ TRUYỀN DỮ LIỆU CÓ SẴN (Không fetch lại nữa)
         return <FlashDealSection data={initialData?.flashDealData} />;
         
      case 'SMART_PRODUCT':
         // Map dữ liệu tương ứng theo title hoặc ID
         let data: any = [];
         if (section.config.title === "ĐỒ ĐIỆN TỬ") data = initialData?.electronicsData;
         if (section.config.title === "SẮC ĐẸP") data = initialData?.beautyData;
         
         return <SmartProductSection {...section.config} preloadedData={data} />;
         
      case 'CATEGORY_TWO_ROW':
          return <DynamicCategoryTwoRow config={section.config} />;

      case 'RECOMMENDED':
          return <RecommendedSection />;
      default: return null;
    }
  }
  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-20">
      {sections.sort((a, b) => a.order - b.order).map((section) => (
        <div key={section.id} className="w-full">
           {renderSection(section)}
        </div>
      ))}
      <ServiceFeaturesSection />
      <LoveGiftsSection />
      <CategoryMenu />
    </div>
  );
};

export default HomeClient;