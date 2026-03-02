"use client";

import React, { useEffect, useState } from "react";
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

import { Product } from "@/types/product";

interface ProductDetailsPageProps {
  product: Product;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product }) => {
  if (!product) return <div>Loading...</div>;

  const [shopProfile, setShopProfile] = useState<ShopProfileData | null>(null);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]); 
  const [systemVouchers, setSystemVouchers] = useState<any[]>([]); 
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  const breadcrumbItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/product" },
    { name: product.title || product.name, href: "#" },
  ];

  useEffect(() => {
    const fetchRealData = async () => {
      const targetShopId = product.sellerId || product.shopId;
      if (!targetShopId) return;

      try {
        setIsLoading(true);
        
        const [shopData, shopVouchersData, systemVouchersData, moreProductsRes] = await Promise.all([
            ShopService.getShopProfile(targetShopId).catch(() => null),
            ShopService.getShopVouchers(targetShopId).catch(() => []), 
            VoucherService.getPublicSystemVouchers().catch(() => []),       
            ProductService.getMoreFromShop(product.id).catch(() => [])
        ]);

        if (shopData) setShopProfile(shopData);

        // Xử lý Voucher: Đảm bảo luôn là mảng
        const validShopVouchers = Array.isArray(shopVouchersData) ? shopVouchersData : (shopVouchersData?.data || []);
        setShopVouchers(validShopVouchers); 
        
        const validSystemVouchers = Array.isArray(systemVouchersData) ? systemVouchersData : (systemVouchersData?.data || []);
        setSystemVouchers(validSystemVouchers);

        // [FIX QUAN TRỌNG]: Map Featured Product đầy đủ mọi trường
        if (moreProductsRes && Array.isArray(moreProductsRes) && moreProductsRes.length > 0) {
            const rawFeatured = moreProductsRes[0];
            
            // Tạo object product đầy đủ nhất có thể để tránh lỗi thiếu field bên ProductCard
            const mappedFeatured: Product = {
                ...rawFeatured, // Copy toàn bộ field gốc trước
                id: rawFeatured.id,
                // Map cả 2 trường tên để component dùng cái nào cũng được
                title: rawFeatured.name || rawFeatured.title || "Sản phẩm nổi bật", 
                name: rawFeatured.name || rawFeatured.title || "Sản phẩm nổi bật",
                
                price: Number(rawFeatured.price),
                
                // Map ảnh: Đảm bảo có cả images array và imageUrl string
                imageUrl: Array.isArray(rawFeatured.images) 
                    ? (typeof rawFeatured.images[0] === 'string' ? rawFeatured.images[0] : rawFeatured.images[0]?.url)
                    : (rawFeatured.imageUrl || "/assets/placeholder.png"),
                images: Array.isArray(rawFeatured.images) ? rawFeatured.images : [],
                
                rating: rawFeatured.rating || 5,
                salesCount: rawFeatured.salesCount || rawFeatured.sold || 0,
                sellerId: targetShopId,
                slug: rawFeatured.slug || rawFeatured.id, // Đảm bảo có slug cho link
            } as Product;

            setFeaturedProduct(mappedFeatured);
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu chi tiết:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, [product.sellerId, product.shopId, product.id]);

  // Merge voucher nếu cần thiết cho ProductInfo
  const allVouchersForMainInfo = [...systemVouchers, ...shopVouchers];

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-12">
      <div className="w-full max-w-[1340px] mx-auto px-4 py-6">
        <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 mb-6 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[45%] flex flex-col gap-8">
              <ProductGallery images={galleryImages} /> 
              <div className="pt-2">
                   <PromoCombo products={[]} /> 
              </div>
            </div>

            <div className="w-full lg:w-[55%]">
              <ProductInfo
                product={product} 
                vouchers={allVouchersForMainInfo} 
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
            <ShopInfo shop={shopProfile} />
        </div>

        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <BoughtTogether mainProduct={product} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full lg:flex-1 flex flex-col gap-2">
            <ProductDescription productTitle={product.title || product.name} description={product.description} /> 
            
            <div className="flex flex-col gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
              <LazyProductRow 
                title="Sản phẩm khác của Shop" 
                productId={product.id} 
                fetcher={ProductService.getMoreFromShop}
                seeMoreLink={`/shop/${product.sellerId || product.shopId}`} 
              />
              <LazyProductRow 
                title="Có thể bạn cũng thích" 
                productId={product.id} 
                fetcher={ProductService.getRelated} 
              />
            </div>
          </div>
          
          {/* SIDEBAR: Truyền đúng props */}
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