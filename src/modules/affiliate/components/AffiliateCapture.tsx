'use client';

/**
 * wiki 0105 — bắt tham số `?aff=<code>` trên trang chi tiết sản phẩm.
 *
 * Không render gì cả, chỉ có tác dụng phụ: ghi cookie quy đổi + báo lượt bấm về BE.
 *
 * Vì sao là component RIÊNG chứ không nhét vào `ProductDetailsPage`: trang sản phẩm là
 * server component (wiki 0101), phần tương tác nằm trong client component con. Tách
 * riêng thứ này giữ nó nhỏ, dễ đọc, và quan trọng hơn là dễ kiểm — nó chạm vào việc
 * QUY ĐỔI TIỀN nên phải kiểm được độc lập với cả trang sản phẩm.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { rememberAffiliate } from '@/lib/affiliate/attribution';
import { AffiliateService } from '@/services/AffiliateService';

export default function AffiliateCapture({ productId }: { productId: string }) {
  const searchParams = useSearchParams();
  const code = (searchParams?.get('aff') ?? '').trim();

  useEffect(() => {
    if (!productId || !code) return;
    // Ghi cookie TRƯỚC rồi mới báo về BE: cookie là thứ quyết định tiền, còn số liệu
    // click chỉ để báo cáo. Nếu mạng hỏng thì thà mất một dòng thống kê còn hơn mất
    // quyền hoa hồng của người đã dẫn khách tới đây.
    rememberAffiliate(productId, code);
    AffiliateService.recordClick(code);
  }, [productId, code]);

  return null;
}
