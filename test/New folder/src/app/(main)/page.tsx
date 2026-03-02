// src/app/(main)/page.tsx
import React from 'react';
import HomeClient from './homeClient';
import { apiClient } from "@/lib/api/ApiClient";

// 1. Hàm lấy dữ liệu trên Server
async function getHomePageData() {
  try {
    const [flashDealRes, newProductsRes, fashionRes] = await Promise.all([
      // A. Flash Deal: Giữ nguyên (nếu API này trả về sp bán chạy/random)
      // Nếu chưa có logic Flash Deal, tạm thời gọi lấy sản phẩm thường
      apiClient.get('/store/products', { params: { limit: 6 } }),
      
      // B. [QUAN TRỌNG] Thay section "Điện thoại" thành "Sản phẩm mới nhất"
      // Bỏ tham số 'search', hệ thống sẽ mặc định sort theo createdAt desc
      apiClient.get('/store/products', { params: { limit: 12 } }),
      
      // C. [TÙY CHỌN] Thay section "Sắc đẹp" thành danh mục bạn đang test (VD: Thời trang nam)
      // Hoặc để trống param search để lấy random
      apiClient.get('/store/products', { params: { limit: 6, categoryId: 'Thời trang nam' } }),
    ]);

    return {
      flashDealData: flashDealRes?.data || [],
      // Map dữ liệu mới vào prop electronicsData (để tái sử dụng UI cũ mà không cần sửa HomeClient)
      electronicsData: newProductsRes?.data || [], 
      beautyData: fashionRes?.data || [],
    };
  } catch (error) {
    console.error("Lỗi tải trang chủ:", error);
    return { flashDealData: [], electronicsData: [], beautyData: [] };
  }
}

// 2. Server Component chính
export default async function ContentPage() {
  const data = await getHomePageData();

  return (
    <HomeClient initialData={data} />
  );
}