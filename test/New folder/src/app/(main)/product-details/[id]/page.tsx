// File: src/app/(main)/product-details/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/ApiClient";
import { useTracking, EventType } from "@/hooks/useTracking"; 
import ProductDetailsPage from "@/modules/product-details/ProductDetailsPage";
import { Product } from "@/types/product"; // Đảm bảo import đúng Type Product

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
        const detailRes = await apiClient.get(`/store/products/${id}`);

        if (detailRes) {
          // --- DEBUG: Log để xem API trả về gì ---
          console.log("API Detail Response:", detailRes); 

          const mappedProduct: Product = {
            id: detailRes.id,
            title: detailRes.name, // API trả về 'name', UI dùng 'title'
            price: Number(detailRes.price), 
            
            // Xử lý ảnh
            imageUrl: Array.isArray(detailRes.images) ? (detailRes.images[0]?.url || detailRes.images[0]) : "/assets/placeholder.png",
            images: Array.isArray(detailRes.images) ? detailRes.images.map((img: any) => img.url || img) : [],
            
            rating: detailRes.rating || 5.0, 
            salesCount: detailRes.salesCount || 0,
            stockTotal: detailRes.stock,
            description: detailRes.description,
            
            sellerId: detailRes.sellerId || detailRes.shopId,
            shopId: detailRes.shopId,

            // =========================================================
            // [FIX QUAN TRỌNG NHẤT Ở ĐÂY]
            // Phải lấy tiers và variations từ API gán vào mappedProduct
            // =========================================================
            tiers: detailRes.tiers || [],           
            variations: detailRes.variations || [], 
            
            // Map attributes JSON
            attributes: detailRes.attributes ? (typeof detailRes.attributes === 'string' ? JSON.parse(detailRes.attributes) : detailRes.attributes) : {},
          };
          
          console.log("Mapped Product for UI:", mappedProduct); // Debug xem có tiers chưa
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

  if (loading) return <div>Loading...</div>; // (Rút gọn loading UI cho ngắn)
  if (error || !product) return <div>Không tìm thấy sản phẩm</div>;

  // Truyền product đã map đầy đủ xuống
  return <ProductDetailsPage product={product} />;
}