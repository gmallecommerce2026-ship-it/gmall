// src/modules/product-details/ProductDetailsPage.tsx
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
import ProductDetailBanner from "@/modules/product-details/components/ProductDetailBanner";
import RelatedBrands from "@/modules/product-details/components/RelatedBrands";
import { StickyBuyBox } from "@/modules/product-details/components/StickyBuyBox";

import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import ShopInfoSkeleton from "@/modules/product-details/components/ShopInfoSkeleton";
import { Product, ProductTier, ProductVariant } from "@/types/product";
import { useTracking, EventType } from "@/hooks/useTracking";

interface ProductDetailsPageProps {
  product?: any;
}

interface CategoryBreadcrumbData {
  id: string | number;
  name: string;
  slug: string;
}

const normalizeProductData = (raw: any): Product => {
  if (!raw) return raw;

  let baseImages: string[] = [];
  if (Array.isArray(raw.images)) {
    baseImages = raw.images.map((img: any) => (typeof img === "string" ? img : img.url));
  } else if (raw.imageUrl) {
    baseImages = [raw.imageUrl];
  }

  let tiers: ProductTier[] = raw.tiers || [];
  let tierImages: string[] = [];

  if (!tiers.length && raw.options && Array.isArray(raw.options)) {
    tiers = raw.options.map((opt: any) => {
      if (opt.images && Array.isArray(opt.images)) {
        tierImages.push(...opt.images.filter((img: string) => !!img));
      }
      return {
        name: opt.name,
        options: Array.isArray(opt.values)
          ? opt.values.map((v: any) => (typeof v === "string" ? v : v.value))
          : [],
        images: opt.images || [],
      };
    });
  } else if (tiers.length > 0) {
    tiers.forEach((t) => {
      if (t.images && t.images.length > 0) {
        tierImages.push(...t.images.filter((i) => !!i));
      }
    });
  }

  const allImages = Array.from(new Set([...baseImages, ...tierImages]));

  let videos: string[] = [];
  if (Array.isArray(raw.videos) && raw.videos.length > 0) {
    videos = raw.videos.map((vid: any) => (typeof vid === "string" ? vid : vid.url)).filter(Boolean);
  }

  if (videos.length === 0 && raw.attributes) {
    try {
      const parsedAttributes =
        typeof raw.attributes === "string" ? JSON.parse(raw.attributes) : raw.attributes;
      if (Array.isArray(parsedAttributes.videos)) {
        videos = parsedAttributes.videos.filter(Boolean);
      }
    } catch (error) {
      console.error("Lỗi parse attributes:", error);
    }
  }

  let variations: ProductVariant[] = raw.variations || [];
  if (variations.length > 0 && tiers.length > 0 && !variations[0].tierIndex) {
    variations = variations.map((v: any) => {
      const tierIndex = tiers.map(() => 0);
      return { ...v, tierIndex };
    });
  }

  return {
    ...raw,
    id: raw.id,
    title: raw.name || raw.title || "Sản phẩm",
    name: raw.name || raw.title || "Sản phẩm",
    slug: raw.slug || "",
    categoryId: raw.categoryId || raw.category?.id || null,
    price: Number(raw.price),
    originalPrice: raw.originalPrice
      ? Number(raw.originalPrice)
      : raw.regularPrice
      ? Number(raw.regularPrice)
      : undefined,
    isDiscountActive: raw.isDiscountActive,
    discountType: raw.discountType,
    discountValue: raw.discountValue,
    images: allImages,
    videos: videos,
    imageUrl: allImages[0] || "/assets/placeholder.png",
    tiers: tiers,
    variations: variations,
    sellerId: raw.sellerId || raw.shopId,
    stock: Number(raw.stock || raw.stockTotal || 0),
    rating: Number(raw.rating || 0),
    salesCount: Number(raw.salesCount || 0),
    brand: raw.brand || "No Brand",
  } as Product;
};

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product: initialProduct }) => {
  const product = useMemo(() => normalizeProductData(initialProduct), [initialProduct]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [syncedState, setSyncedState] = useState<any>({
    finalPrice: product.price,
    displayStock: product.stock || 0,
    isAddingCart: false,
    isGifting: false,
    handleAddToCart: () => {},
    handleBuyNow: () => {},
    handleGiftNow: () => {},
  });

  const { track } = useTracking();
  useEffect(() => {
    if (product?.id) {
      track(EventType.VIEW_PRODUCT, product.id, {
        price: product?.price,
        category: product.categoryId ? String(product.categoryId) : "unknown",
      });
    }
  }, [product?.id, product?.price, product?.categoryId, track]);

  const [categoryBreadcrumbs, setCategoryBreadcrumbs] = useState<CategoryBreadcrumbData[]>([]);
  const [shopProfile, setShopProfile] = useState<ShopProfileData | null>(null);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]);
  const [systemVouchers, setSystemVouchers] = useState<any[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = useMemo(() => {
    const base = [{ name: "Trang chủ", href: "/" }];
    if (categoryBreadcrumbs.length > 0) {
      categoryBreadcrumbs.forEach((cat) => {
        base.push({
          name: cat.name,
          href: `/category/${cat.slug || cat.id}`,
        });
      });
    }
    base.push({ name: product.title, href: "#" });
    return base;
  }, [categoryBreadcrumbs, product.title]);

  useEffect(() => {
    const fetchRealData = async () => {
      if (product.categoryId) {
        try {
          const breadcrumbs = await CategoryService.getBreadcrumbs(product.categoryId);
          if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
            setCategoryBreadcrumbs(breadcrumbs);
          }
        } catch (e) {
          console.error("[ProductDetailsPage] Exception:", e);
        }
      }
      setIsLoading(false);
    };

    fetchRealData();
  }, [product.sellerId, product.id, product.categoryId]);

  const allVouchersForMainInfo = [...systemVouchers, ...shopVouchers];

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-12">
      <div className="w-full max-w-[1340px] mx-auto px-4 py-6">
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="mb-4">
          <ProductDetailBanner />
        </div>

        <div className="mb-6">
          <RelatedBrands categoryId={product.categoryId} />
        </div>

        {/* TOP SECTION: BỐ CỤC 3 CỘT (MÔ HÌNH TIKI / AMAZON) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* CỘT 1: BỘ SƯU TẬP ẢNH & VIDEO (W-32%) */}
            <div className="w-full lg:w-[32%] flex flex-col gap-6 shrink-0">
              <ProductGallery
                images={product.images || []}
                videos={product.videos || []}
                activeImage={previewImage}
              />
              <PromoCombo products={[]} />
            </div>

            {/* CỘT 2: THÔNG TIN CHI TIẾT SẢN PHẨM Ở GIỮA (FLEX-1) */}
            <div className="w-full lg:flex-1">
              <ProductInfo
                product={product}
                vouchers={allVouchersForMainInfo}
                onHoverVariant={(img) => setPreviewImage(img)}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onSyncState={(state) => setSyncedState(state)}
              />
            </div>

            {/* CỘT 3: KHỐI MUA HÀNG STICKY BÊN PHẢI (W-280px / 300px) */}
            <div className="w-full lg:w-[280px] xl:w-[310px] shrink-0 hidden lg:block">
              <StickyBuyBox
                product={product}
                shopProfile={shopProfile}
                quantity={quantity}
                onQuantityChange={setQuantity}
                finalPrice={syncedState.finalPrice || product.price}
                displayStock={syncedState.displayStock ?? (product.stock || 0)}
                isAddingCart={syncedState.isAddingCart}
                isGifting={syncedState.isGifting}
                onAddToCart={syncedState.handleAddToCart}
                onBuyNow={syncedState.handleBuyNow}
                onGiftNow={syncedState.handleGiftNow}
              />
            </div>
          </div>
        </div>

        {/* CÁC PHẦN DƯỚI GIỮ NGUYÊN LAYOUT */}
        <div className="mb-6">
          {isLoading && !shopProfile ? <ShopInfoSkeleton /> : <ShopInfo shop={shopProfile} />}
        </div>

        <div className="mt-4">
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
                seeMoreLink={product.sellerId ? `/shop/${product.sellerId}` : "#"}
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
              <Sidebar vouchers={shopVouchers} featuredProduct={featuredProduct} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;