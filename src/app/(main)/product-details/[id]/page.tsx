// File: src/app/(main)/product-details/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/ApiClient";
import { useTracking, EventType } from "@/hooks/useTracking"; 
import ProductDetailsPage from "@/modules/product-details/ProductDetailsPage";
// Import Skeleton Component
import ProductDetailSkeleton from "@/modules/product-details/components/ProductDetailSkeleton"; 
import { Product } from "@/types/product"; 

export default function ProductDetailPageWrapper() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 
  const { track } = useTracking();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(false);
        
        // Gọi API lấy chi tiết sản phẩm
        const detailRes: any = await apiClient.get(`/store/products/${id}`);

        if (detailRes) {
          const mappedProduct: Product = {
            id: detailRes.id,
            title: detailRes.name,
            categoryId: detailRes.categoryId || detailRes.category?.id || null,
            
            // [FIX] Bổ sung 2 trường bắt buộc này:
            slug: detailRes.slug || "", 
            status: detailRes.status || 'ACTIVE', 
            
            // --- [FIX QUAN TRỌNG] MAP GIÁ & GIẢM GIÁ ---
            price: Number(detailRes.price), // Giá bán hiện tại
            originalPrice: detailRes.originalPrice ? Number(detailRes.originalPrice) : undefined, // Giá gốc (để gạch ngang)
            regularPrice: detailRes.originalPrice ? Number(detailRes.originalPrice) : undefined, // Alias dự phòng
            
            isDiscountActive: detailRes.isDiscountActive,
            discountType: detailRes.discountType,
            discountValue: detailRes.discountValue,
            discountPercent: detailRes.discountPercent,
            // ---------------------------------------------

            imageUrl: Array.isArray(detailRes.images) ? (detailRes.images[0]?.url || detailRes.images[0]) : "/assets/placeholder.png",
            images: Array.isArray(detailRes.images) ? detailRes.images.map((img: any) => img.url || img) : [],
            rating: detailRes.rating || 5.0,
            salesCount: detailRes.salesCount || 0,
            stockTotal: detailRes.stock,
            description: detailRes.description,
            sellerId: detailRes.sellerId || detailRes.shopId,
            shopId: detailRes.shopId, // Alias
            tiers: detailRes.tiers || [],
            variants: detailRes.variants || [],
            attributes: detailRes.attributes ? (typeof detailRes.attributes === 'string' ? JSON.parse(detailRes.attributes) : detailRes.attributes) : {},
            
            // Bổ sung thêm brand nếu cần
            brand: detailRes.brand || "No Brand",
          };

          setProduct(mappedProduct);
        } else {
            setError(true);
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Tracking logic...
  useEffect(() => {
    if (product?.id) {
      track(EventType.VIEW_PRODUCT, product.id, { 
        price: product?.price,
        category: 'fashion' 
      });
    }
  }, [product, track]);

  if (loading) return <ProductDetailSkeleton />; 

  if (error || !product) {
    return (
        <div className="w-full h-[50vh] flex flex-col items-center justify-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
            <p>Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
    );
  }

  return <ProductDetailsPage product={product} />;
}