// src/app/(main)/shop/[id]/page.tsx
//
// Wiki 0104 (đợt 5): trang gian hàng TRƯỚC ĐÂY là một file `"use client"` duy nhất, nên
// **không thể** khai metadata. Đo trên prod với gian hàng "Mẹ và Bé" (512 sản phẩm):
// thẻ `<title>` là tiêu đề mặc định của trang chủ, HTML thô có **0 link sản phẩm**.
// Người dùng thật vẫn xem được (JS chạy xong thì nội dung hiện), nhưng:
//   * chia sẻ link gian hàng lên Zalo/Facebook không ra tên shop,
//   * Google lập chỉ mục một trang rỗng mang tiêu đề trùng trang chủ.
//
// Tách làm hai: file này là server component chỉ lo metadata, phần giao diện giữ NGUYÊN
// trong `ShopDetailClient.tsx` (không đổi một dòng logic nào) — cùng khuôn đã dùng cho
// trang chi tiết sản phẩm ở [0101].

import React from 'react';
import type { Metadata } from 'next';
import ShopDetailClient from './ShopDetailClient';
import { getShopProfile } from '@/services/shop.server';

export const dynamic = 'force-dynamic';

/** Bỏ thẻ HTML và rút gọn mô tả gian hàng để dùng làm meta description. */
function toPlainText(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const shopId = resolvedParams?.id as string;

  const shop = await getShopProfile(shopId);
  if (!shop) {
    // Không lấy được hồ sơ → vẫn trả tiêu đề có nghĩa, KHÔNG để rơi về tiêu đề trang chủ.
    return { title: 'Gian hàng', robots: { index: false, follow: true } };
  }

  const count = shop.totalProducts ? `${shop.totalProducts} sản phẩm · ` : '';
  const description = shop.description
    ? toPlainText(shop.description)
    : `${count}Mua sắm tại gian hàng ${shop.name} trên GMall. Hàng chính hãng, giao nhanh toàn quốc.`;

  return {
    title: shop.name,
    description,
    alternates: { canonical: `/shop/${shopId}` },
    openGraph: {
      title: `${shop.name} | GMall`,
      description,
      url: `/shop/${shopId}`,
      type: 'website',
      ...(shop.avatar ? { images: [{ url: shop.avatar, alt: shop.name }] } : {}),
    },
  };
}

export default function ShopPage() {
  return <ShopDetailClient />;
}
