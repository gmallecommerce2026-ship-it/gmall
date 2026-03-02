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

import { ProductService } from "@/services/product.service";
import { ShopService } from "@/services/shop.service";
import { VoucherService } from "@/services/voucher.service";

import { Product, ProductTier, ProductVariant } from "@/types/product";

interface ProductDetailsPageProps {
  product: any; // Chấp nhận any để handle dữ liệu thô từ API
}

// --- HELPER: Chuẩn hóa dữ liệu Product từ API về Frontend Type ---
const normalizeProductData = (raw: any): Product => {
  if (!raw) return raw;

  // 1. Xử lý ảnh (string[] hoặc {url: string}[])
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images.map((img: any) => typeof img === 'string' ? img : img.url);
  } else if (raw.imageUrl) {
    images = [raw.imageUrl];
  }

  // 2. Xử lý Tiers (Phân loại hàng: Màu, Size...)
  let tiers: ProductTier[] = raw.tiers || [];
  // Nếu API trả về 'options' thay vì 'tiers' (cấu trúc thường thấy)
  if ((!tiers.length) && raw.options && Array.isArray(raw.options)) {
    tiers = raw.options.map((opt: any) => ({
      name: opt.name,
      // Map values: có thể là mảng string hoặc mảng object {value: "Đỏ", ...}
      options: Array.isArray(opt.values) 
        ? opt.values.map((v: any) => typeof v === 'string' ? v : v.value)
        : [],
      images: opt.images || [] 
    }));
  }

  // 3. Xử lý Variations (Biến thể SKU)
  let variations: ProductVariant[] = raw.variations || [];
  // Nếu chưa có tierIndex, cố gắng map từ options
  if (variations.length > 0 && tiers.length > 0 && (!variations[0].tierIndex)) {
     variations = variations.map((v: any) => {
        // Giả định backend trả về optionValues khớp thứ tự tiers
        // Logic này cần điều chỉnh tuỳ theo thực tế response backend của bạn
        const tierIndex = tiers.map(t => 0); // Placeholder nếu không map được
        return { ...v, tierIndex };
     });
  }

  return {
    ...raw,
    id: raw.id,
    title: raw.name || raw.title || "Sản phẩm", // Ưu tiên name
    name: raw.name || raw.title || "Sản phẩm",
    price: Number(raw.price), // Đảm bảo là số
    regularPrice: raw.original_price ? Number(raw.original_price) : undefined,
    images: images,
    imageUrl: images[0] || "/assets/placeholder.png",
    tiers: tiers,
    variations: variations,
    sellerId: raw.sellerId || raw.shopId, // Normalize shop ID
    stock: Number(raw.stock || raw.stockTotal || 0),
  } as Product;
};

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product: initialProduct }) => {
  // Chuẩn hóa ngay đầu vào
  const product = useMemo(() => normalizeProductData(initialProduct), [initialProduct]);

  if (!product) return <div>Loading...</div>;

  const [shopProfile, setShopProfile] = useState<ShopProfileData | null>(null);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]); 
  const [systemVouchers, setSystemVouchers] = useState<any[]>([]); 
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/product" },
    { name: product.title, href: "#" },
  ];

  useEffect(() => {
    const fetchRealData = async () => {
      // [FIX] Ưu tiên sellerId từ product (đã normalize), fallback sang shopId nếu có
      const targetShopId = product.sellerId || (product as any).shopId; 
      
      if (!targetShopId) {
          console.warn("Missing shop/seller ID for product", product.id);
          return;
      }

      try {
        setIsLoading(true);
        
        const [shopData, shopVouchersRes, systemVouchersRes, moreProductsRes] = await Promise.all([
            ShopService.getShopProfile(targetShopId).catch(() => null),
            ShopService.getShopVouchers(targetShopId).catch(() => []), 
            VoucherService.getPublicSystemVouchers().catch(() => []),       
            ProductService.getMoreFromShop(product.id).catch(() => [])
        ]);

        if (shopData) setShopProfile(shopData); // API trả về object trực tiếp nên gán luôn

        // Xử lý Voucher: API trả về mảng trực tiếp
        const validShopVouchers = Array.isArray(shopVouchersRes) ? shopVouchersRes : (shopVouchersRes?.data || []);
        setShopVouchers(validShopVouchers); 
        
        const validSystemVouchers = Array.isArray(systemVouchersRes) ? systemVouchersRes : (systemVouchersRes?.data || []);
        setSystemVouchers(validSystemVouchers);

        // Xử lý Featured Product (Lấy sản phẩm đầu tiên từ list 'more from shop')
        const moreList = Array.isArray(moreProductsRes) ? moreProductsRes : (moreProductsRes?.data || []);
        if (moreList.length > 0) {
            setFeaturedProduct(normalizeProductData(moreList[0]));
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu chi tiết:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, [product.sellerId, product.id]);

  const allVouchersForMainInfo = [...systemVouchers, ...shopVouchers];

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-12">
      <div className="w-full max-w-[1340px] mx-auto px-4 py-6">
        <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT: GALLERY */}
            <div className="w-full lg:w-[45%] flex flex-col gap-8">
              <ProductGallery images={product.images || []} /> 
              <div className="pt-2">
                   <PromoCombo products={[]} /> 
              </div>
            </div>

            {/* RIGHT: INFO */}
            <div className="w-full lg:w-[55%]">
              <ProductInfo
                product={product} 
                vouchers={allVouchersForMainInfo} 
              />
            </div>
          </div>
        </div>
        
        {/* SHOP INFO BLOCK */}
        <div className="mb-6">
            <ShopInfo shop={shopProfile} />
        </div>

        {/* BOUGHT TOGETHER */}
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <BoughtTogether mainProduct={product} />
        </div>

        {/* DESCRIPTION & RELATED */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full lg:flex-1 flex flex-col gap-2">
            <ProductDescription productTitle={product.title} description={product.description} /> 
            
            <div className="flex flex-col gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
              {/* Truyền product.sellerId vào seeMoreLink để fix link xem shop */}
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
          
          {/* SIDEBAR */}
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