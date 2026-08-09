// File: src/app/(main)/product-details/[id]/page.tsx
//
// SERVER COMPONENT — lấy dữ liệu sản phẩm ngay trên server.
//
// Trước đây file này là `"use client"` + `useParams()` + `apiClient.get()` trong `useEffect`:
// HTML do SSR trả về chỉ có `ProductDetailSkeleton`, tên/giá/mô tả/ảnh KHÔNG nằm trong HTML
// gốc — crawler phải chạy JS rồi chờ thêm một vòng API, và LCP bị đẩy lùi đúng một round-trip.
// Xem docs/wiki/decisions/0101-product-details-server-component.md (và mục 10 của 0100).
//
// Phần tương tác (chọn phân loại, thêm giỏ, tracking `useTracking`) vẫn nằm nguyên trong
// client component con `ProductDetailsPage` — ở đây CHỈ chuyển việc lấy dữ liệu lên server.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailsPage from '@/modules/product-details/ProductDetailsPage';
import { getProductDetail } from '@/services/product.server';
import { BRAND } from '@/lib/brand';
import type { Product } from '@/types/product';

interface PageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = `https://${BRAND.domain}`;

/**
 * Canonical trỏ theo `id`: toàn site link sản phẩm bằng id (`/product-details/${p.id}`), chỉ
 * một chỗ dùng slug. BE nhận cả id lẫn slug nên hai URL cùng ra một trang — canonical gom
 * chúng về đúng dạng đang được link.
 */
const canonicalPath = (product: Product) => `/product-details/${encodeURIComponent(product.id)}`;

/** Mô tả sản phẩm là HTML → gỡ thẻ, gộp khoảng trắng, cắt ~160 ký tự cho thẻ meta. */
function toMetaDescription(product: Product): string {
  const stripped = (product.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const text = stripped || `Mua ${product.title} giá tốt, giao nhanh tại ${BRAND.name}.`;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  let product: Product | null = null;
  try {
    product = await getProductDetail(id);
  } catch {
    // BE lỗi/không với tới được: trả metadata tối thiểu để `<head>` vẫn hợp lệ. Chính page
    // bên dưới sẽ throw tiếp → request trả 5xx (đúng ngữ nghĩa "thử lại sau"), chứ không
    // biến sự cố hạ tầng thành 404.
    return { title: BRAND.name };
  }

  if (!product) {
    return {
      title: `Không tìm thấy sản phẩm | ${BRAND.name}`,
      robots: { index: false, follow: false },
    };
  }

  const description = toMetaDescription(product);
  const url = canonicalPath(product);
  const images = product.imageUrl ? [product.imageUrl] : [];

  return {
    // Root layout chưa khai báo `metadataBase`; đặt ở đây để ảnh/URL tương đối
    // (vd `/assets/placeholder.png`) được nở thành absolute trong og:image + canonical.
    metadataBase: new URL(SITE_URL),
    title: `${product.title} | ${BRAND.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      // Next chỉ nhận các `type` trong union của nó — không có 'product', dùng 'website'.
      type: 'website',
      siteName: BRAND.name,
      title: product.title,
      description,
      url,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images,
    },
  };
}

/**
 * JSON-LD schema.org/Product — để Google hiện rich result (giá, tình trạng còn hàng).
 * KHÔNG khai `aggregateRating`: `rating` mặc định về 5.0 khi BE không trả, khai lên sẽ là
 * đánh giá bịa → Google phạt.
 */
function buildProductJsonLd(product: Product, description: string) {
  const images = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    image: images,
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand || BRAND.name },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${canonicalPath(product)}`,
      priceCurrency: 'VND',
      price: product.price,
      availability:
        (product.stockTotal ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Không tồn tại / không ACTIVE → 404 chuẩn (not-found.tsx cùng thư mục), thay cho state
  // `error` thủ công của bản client cũ. Lỗi khác (BE sập, timeout) được `getProductDetail`
  // throw lên error.tsx.
  const product = await getProductDetail(id);
  if (!product) notFound();

  const jsonLd = buildProductJsonLd(product, toMetaDescription(product));

  return (
    <>
      <script
        type="application/ld+json"
        // Escape `<` → tên sản phẩm chứa `</script>` không thoát ra khỏi thẻ được.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetailsPage product={product} />
    </>
  );
}
