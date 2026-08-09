import ProductDetailSkeleton from "@/modules/product-details/components/ProductDetailSkeleton";

// Fallback của Suspense boundary bao quanh `[id]/page.tsx` (async server component).
//
// KHÔNG xoá file này: `src/app/(main)/loading.tsx` đã tạo boundary cho TOÀN BỘ route group
// `(main)` với fallback là `HomeSkeleton`. Bỏ file này đi thì trang chi tiết sản phẩm không
// hết boundary — nó chỉ đổi sang nhấp nháy khung TRANG CHỦ, tệ hơn.
//
// Hệ quả của boundary (đã đo, ghi ở wiki 0101 mục 5): nội dung thật nằm trong
// `<div hidden id="S:x">` của cùng một response rồi được script inline của React kéo vào
// `<main>`; `<head>` (title/description/og/canonical/JSON-LD) thì KHÔNG bị stream.
export default function Loading() {
  return <ProductDetailSkeleton />;
}
