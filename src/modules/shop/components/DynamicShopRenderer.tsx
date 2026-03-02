"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShopService } from '@/services/shop.service';
// Import component ProductCard (Lưu ý đường dẫn import phải đúng với project của bạn)
import ProductCard from '@/modules/product/components/ProductCard'; 
import { ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

// --- HELPER: Xử lý ảnh từ JSON Prisma (Để tránh lỗi ảnh trắng/undefined) ---
const getImageUrl = (imgData: any): string => {
    if (!imgData) return '/placeholder.png';
    // Trường hợp 1: Là chuỗi (URL trực tiếp)
    if (typeof imgData === 'string') return imgData;
    // Trường hợp 2: Là mảng
    if (Array.isArray(imgData) && imgData.length > 0) {
        const first = imgData[0];
        // Mảng chuỗi ["url1", "url2"]
        if (typeof first === 'string') return first;
        // Mảng object [{url: "...", ...}]
        if (typeof first === 'object' && first.url) return first.url;
    }
    return '/placeholder.png';
};

// --- TYPES ---
interface SectionConfig {
  id: string;
  type: 'BANNER_CAROUSEL' | 'PRODUCT_HIGHLIGHT' | 'VIDEO' | 'VOUCHER_LIST';
  title?: string;
  config: any;
}

// --- 1. BANNER SECTION ---
const BannerSection = ({ config }: { config: any }) => {
  if (!config?.images || config.images.length === 0) return null;

  // Lấy ảnh đầu tiên để demo, nếu có nhiều ảnh nên dùng thư viện Carousel (như Swiper)
  const imageUrl = getImageUrl(config.images);

  return (
    <div 
      className="w-full relative overflow-hidden rounded-lg mb-6 shadow-sm group" 
      style={{ height: config.height ? Number(config.height) : 300 }}
    >
       <Image 
         src={imageUrl} 
         alt="Shop Banner" 
         fill 
         className="object-cover group-hover:scale-105 transition-transform duration-700"
         priority 
         sizes="(max-width: 768px) 100vw, 1200px"
       />
    </div>
  );
};

// --- 2. PRODUCT HIGHLIGHT (Fix props ProductCard) ---
const ProductHighlightSection = ({ shopId, config, title }: { shopId: string, config: any, title?: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;

    const fetchProducts = async () => {
       try {
         let rawData = [];

         // CASE A: Chọn thủ công (Manual) -> Có danh sách IDs trong config
         if (config.type === 'manual' && Array.isArray(config.productIds) && config.productIds.length > 0) {
             // Gọi API lấy danh sách sản phẩm (có thể dùng search để filter nhanh)
             const res: any = await ShopService.getShopProducts(shopId, { limit: 50 }); 
             const allProducts = res.data || res; 
             // Lọc client-side những ID được chọn
             rawData = allProducts.filter((p: any) => config.productIds.includes(p.id));
         } 
         // CASE B: Tự động (Newest / Best Seller)
         else {
             const params = {
                limit: Number(config.limit) || 4,
                sort: config.type === 'best_seller' ? 'sales' : 'newest',
                page: 1
             };
             const res: any = await ShopService.getShopProducts(shopId, params);
             rawData = res.data || []; 
         }

         // Map dữ liệu từ Backend sang format FE cần dùng
         const mapped = rawData.map((p: any) => ({
             id: p.id,
             title: p.name, 
             imageUrl: getImageUrl(p.thumbnail || p.images), 
             price: Number(p.price),
             originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
             rating: Number(p.rating || 0),
             sold: p.salesCount || 0,
             slug: p.slug
         }));

         setProducts(mapped);
       } catch (e) { 
         console.error("[DynamicRenderer] Error:", e); 
       } finally {
         setLoading(false);
       }
    };
    fetchProducts();
  }, [shopId, config, title]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="mb-8 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
       <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg uppercase border-l-4 border-brand-orange pl-3">
            {title || 'Sản phẩm nổi bật'}
          </h3>
          <Link href="#all-products-section" className="text-brand-orange text-sm flex items-center hover:underline font-medium">
            Xem tất cả <ChevronRight size={16}/>
          </Link>
       </div>
       
       {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-md"></div>)}
          </div>
       ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((p) => (
                 /* [FIX] Truyền đúng props lẻ thay vì object product={p} */
                 <ProductCard 
                    key={p.id}
                    id={p.id}
                    image={p.imageUrl}
                    title={p.title}
                    price={p.price.toLocaleString('vi-VN') + 'đ'}
                    originalPrice={p.originalPrice ? p.originalPrice.toLocaleString('vi-VN') + 'đ' : undefined}
                    discount={p.originalPrice && p.price < p.originalPrice ? `-${Math.round((1 - p.price/p.originalPrice) * 100)}%` : undefined}
                    sold={p.sold > 0 ? `Đã bán ${p.sold}` : undefined}
                    location="Việt Nam" // Hoặc lấy từ p.origin nếu có
                 />
              ))}
          </div>
       )}
    </div>
  );
};

// --- 3. VIDEO SECTION ---
const VideoSection = ({ config }: { config: any }) => {
    if (!config.url) return null;
    return (
        <div className="mb-8 bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-lg">
             {config.cover && (
                <Image src={config.cover} alt="Video Cover" fill className="object-cover opacity-60" />
             )}
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
             <a href={config.url} target="_blank" rel="noopener noreferrer" className="z-10 flex flex-col items-center">
                <PlayCircle size={64} className="text-white opacity-90 group-hover:scale-110 transition-transform mb-2"/>
                <span className="text-white text-sm font-medium drop-shadow-md">Xem Video</span>
             </a>
        </div>
    );
}

// --- MAIN RENDERER ---
export default function DynamicShopRenderer({ decoration, shopId }: { decoration: any, shopId: string }) {
  if (!decoration || !decoration.sections || decoration.sections.length === 0) return null;
  const { sections, settings } = decoration;

  return (
    <div className="w-full mb-8 relative rounded-xl overflow-hidden" style={{ backgroundColor: settings?.backgroundColor || 'transparent' }}>
        {/* Background Parallax */}
        {settings?.backgroundImage && (
             <div 
               className="absolute inset-0 z-0 opacity-100 pointer-events-none" 
               style={{ 
                   backgroundImage: `url('${settings.backgroundImage}')`, 
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   backgroundAttachment: 'fixed'
               }}
             />
        )}
        <div className="relative z-10 flex flex-col p-4">
            {sections.map((section: SectionConfig) => {
                switch (section.type) {
                    case 'BANNER_CAROUSEL':
                        return <BannerSection key={section.id} config={section.config} />;
                    case 'PRODUCT_HIGHLIGHT':
                        return <ProductHighlightSection key={section.id} shopId={shopId} title={section.title} config={section.config} />;
                    case 'VIDEO':
                         return <VideoSection key={section.id} config={section.config} />;
                    default: return null;
                }
            })}
        </div>
    </div>
  );
}