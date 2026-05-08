// File: src/modules/product-details/ProductDetailsPage.tsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductGallery from "@/modules/product-details/components/ProductGallery";
import ProductInfo from "@/modules/product-details/components/ProductInfo";
import ShopInfo, { ShopProfileData } from "@/modules/product-details/components/ShopInfo";
import ProductDescription from "@/modules/product-details/components/ProductDescription";
import Sidebar from "@/modules/product-details/components/Sidebar";
import PromoCombo from "@/modules/product-details/components/PromoCombo";
import { LazyProductRow } from "./components/LazyProductRow";
import { BoughtTogether } from "./components/BoughtTogether";
import ProductReviews from "@/modules/product-details/components/ProductReviews";

import { ProductService } from "@/services/product.service";
import { ShopService } from "@/services/shop.service";
import { VoucherService } from "@/services/voucher.service";
import { CategoryService, Category } from "@/services/category.service"; // [NEW] Import CategoryService
import ShopInfoSkeleton from "@/modules/product-details/components/ShopInfoSkeleton";
import { Product, ProductTier, ProductVariant } from "@/types/product";
// import { api } from "@/services/api"; // [REMOVED] Không cần dùng trực tiếp api nữa cho category

import { useTracking, EventType } from "@/hooks/useTracking"; 

// TS-fix wiki 0031: `product` optional vì page route có thể fetch tự thân (xem app/(main)/product-details/page.tsx)
interface ProductDetailsPageProps {
  product?: any;
}

// [UPDATED] Dùng luôn interface từ Service hoặc map tương đương
interface CategoryBreadcrumbData {
  id: string | number;
  name: string;
  slug: string;
}

// --- HELPER: NORMALIZE DATA ---
const normalizeProductData = (raw: any): Product => {
  if (!raw) return raw;

  // 1. Lấy ảnh gốc
  let baseImages: string[] = [];
  if (Array.isArray(raw.images)) {
    baseImages = raw.images.map((img: any) => typeof img === 'string' ? img : img.url);
  } else if (raw.imageUrl) {
    baseImages = [raw.imageUrl];
  }

  // 2. Xử lý Tiers & Lấy ảnh từ Tiers
  let tiers: ProductTier[] = raw.tiers || [];
  let tierImages: string[] = []; 

  if ((!tiers.length) && raw.options && Array.isArray(raw.options)) {
    tiers = raw.options.map((opt: any) => {
      if (opt.images && Array.isArray(opt.images)) {
        tierImages.push(...opt.images.filter((img: string) => !!img));
      }
      return {
        name: opt.name,
        options: Array.isArray(opt.values) 
          ? opt.values.map((v: any) => typeof v === 'string' ? v : v.value)
          : [],
        images: opt.images || [] 
      };
    });
  } else if (tiers.length > 0) {
     tiers.forEach(t => {
         if (t.images && t.images.length > 0) {
             tierImages.push(...t.images.filter(i => !!i));
         }
     });
  }

  const allImages = Array.from(new Set([...baseImages, ...tierImages]));

  // 3. Xử lý Variations
  let variations: ProductVariant[] = raw.variations || [];
  if (variations.length > 0 && tiers.length > 0 && (!variations[0].tierIndex)) {
     variations = variations.map((v: any) => {
        const tierIndex = tiers.map(t => 0); 
        return { ...v, tierIndex };
     });
  }

  return {
    ...raw, // Spread data gốc trước
    id: raw.id,
    title: raw.name || raw.title || "Sản phẩm",
    name: raw.name || raw.title || "Sản phẩm",
    slug: raw.slug || "", 
    categoryId: raw.categoryId || raw.category?.id || null, 
    
    // [FIX] Đảm bảo Price và OriginalPrice được map đúng kiểu số
    price: Number(raw.price),
    // Ưu tiên originalPrice (giá gốc API) -> regularPrice (alias) -> undefined
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : (raw.regularPrice ? Number(raw.regularPrice) : undefined),
    
    // [FIX] Map lại explicit các trường giảm giá để chắc chắn
    isDiscountActive: raw.isDiscountActive,
    discountType: raw.discountType,
    discountValue: raw.discountValue,
    
    images: allImages, 
    imageUrl: allImages[0] || "/assets/placeholder.png",
    tiers: tiers,
    variations: variations,
    sellerId: raw.sellerId || raw.shopId,
    stock: Number(raw.stock || raw.stockTotal || 0), 
    rating: Number(raw.rating || 0),
    salesCount: Number(raw.salesCount || 0),
    brand: raw.brand || "No Brand"
  } as Product;
};

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product: initialProduct }) => {
  const product = useMemo(() => normalizeProductData(initialProduct), [initialProduct]);

  console.log("[ProductDetailsPage] Render với Product:", {
     id: product.id,
     name: product.title,
     categoryId: product.categoryId // <-- Quan trọng: Kiểm tra xem cái này có null không?
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const { track } = useTracking();
  useEffect(() => {
    if (product?.id) {
      track(EventType.VIEW_PRODUCT, product.id, {
        price: product?.price,
        category: product.categoryId ? String(product.categoryId) : 'unknown'
      });
    }
    // hooks-fix wiki 0031: thêm price/categoryId — chỉ trigger lại khi tracking metadata đổi
  }, [product?.id, product?.price, product?.categoryId, track]);

  const [categoryBreadcrumbs, setCategoryBreadcrumbs] = useState<CategoryBreadcrumbData[]>([]);
  const [shopProfile, setShopProfile] = useState<ShopProfileData | null>(null);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]); 
  const [systemVouchers, setSystemVouchers] = useState<any[]>([]); 
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    console.log("[ProductDetailsPage] State categoryBreadcrumbs đã cập nhật:", categoryBreadcrumbs);
  }, [categoryBreadcrumbs]);
  const breadcrumbItems = useMemo(() => {
      const base = [
        { name: "G-Mall", href: "/" },
      ];

      // [UPDATED] Render danh mục đa cấp
      if (categoryBreadcrumbs.length > 0) {
          categoryBreadcrumbs.forEach(cat => {
              base.push({ 
                  name: cat.name, 
                  href: `/category/${cat.slug || cat.id}` 
              });
          });
      }
      base.push({ name: product.title, href: "#" });
      return base;
  }, [categoryBreadcrumbs, product.title]);

  useEffect(() => {
    const fetchRealData = async () => {
      const targetShopId = 
        (product as any).shop?.id || 
        (product as any).shopId || 
        product.sellerId;

      if (product.categoryId) {
        console.log("[ProductDetailsPage] Bắt đầu fetch breadcrumbs cho categoryId:", product.categoryId);
        try {
            const breadcrumbs = await CategoryService.getBreadcrumbs(product.categoryId);
            
            if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
                console.log("[ProductDetailsPage] Đã set state breadcrumbs thành công với số lượng:", breadcrumbs.length);
                setCategoryBreadcrumbs(breadcrumbs);
            } else {
                console.warn("[ProductDetailsPage] API trả về mảng rỗng hoặc không hợp lệ.");
            }
        } catch (e) {
            console.error("[ProductDetailsPage] Exception khi gọi service:", e);
        }
      } else {
        console.warn("[ProductDetailsPage] KHÔNG fetch được vì product.categoryId bị null/undefined!");
      }

      if (!targetShopId) {
        setIsLoading(false);
        // [XÓA] Đoạn code gọi api.get('/categories/hierarchy/...') cũ ở đây
        return;
      }

      try {
        setIsLoading(true);
        // ... (giữ nguyên logic fetch ShopProfile, Vouchers...)
      } catch (error) {
        console.error("Lỗi tải dữ liệu chi tiết phụ:", error);
      } finally {
        setIsLoading(false);
      }
      
      // [XÓA] Đoạn code gọi api.get('/categories/hierarchy/...') cũ ở cuối hàm nếu có
    };

    fetchRealData();
    // hooks-fix wiki 0031: chỉ phụ thuộc các field định danh; toàn bộ object 'product' đổi
    // identity mỗi render sẽ gây fetch lặp. Disable rule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.sellerId, product.id, product.categoryId]);

  const allVouchersForMainInfo = [...systemVouchers, ...shopVouchers];

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-12">
      <div className="w-full max-w-[1340px] mx-auto px-4 py-6">
        <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Product",
                  "name": product.title,
                  "image": product.images || [],
                  "description": product.description ? product.description.substring(0, 160) : "",
                  "sku": product.id,
                  "offers": {
                    "@type": "Offer",
                    "priceCurrency": "VND",
                    "price": product.price,
                    "availability": (product.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  },
                }
              ]
            })
          }}
        />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[45%] flex flex-col gap-8">
              <ProductGallery 
                  images={product.images || []} 
                  activeImage={previewImage} 
              />
              <div className="pt-2">
                   <PromoCombo products={[]} /> 
              </div>
            </div>

            <div className="w-full lg:w-[55%]">
              <ProductInfo
                product={product} 
                vouchers={allVouchersForMainInfo}
                onHoverVariant={(img) => setPreviewImage(img)}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
            {isLoading && !shopProfile ? (
                <ShopInfoSkeleton /> 
            ) : (
                <ShopInfo shop={shopProfile} />
            )}
        </div>

        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <BoughtTogether mainProduct={product} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full lg:flex-1 flex flex-col gap-2">
            
            <ProductDescription productTitle={product.title} description={product.description} /> 
            
            <ProductReviews productId={product.id} />

            <div className="flex flex-col gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
              <LazyProductRow 
                title="Sản phẩm khác của Shop" 
                productId={product.id} 
                fetcher={ProductService.getMoreFromShop}
                seeMoreLink={product.sellerId ? `/shop/${product.sellerId}` : '#'} 
              />
              <LazyProductRow 
                title="Có thể bạn cũng thích" 
                productId={product.id} 
                fetcher={ProductService.getRelated} 
              />
            </div>
          </div>
          
          <div className="w-full lg:w-[340px] flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
                <Sidebar
                  vouchers={shopVouchers} 
                  featuredProduct={featuredProduct}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;