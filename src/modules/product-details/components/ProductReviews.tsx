'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Star, User, ThumbsUp } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { format } from 'date-fns'; // hoặc dùng native Date

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any>({});
  const [filterRating, setFilterRating] = useState<number | null>(null); // null = All
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await ProductService.getReviews(productId, {
        page,
        rating: filterRating || undefined
      });
      // [FIX wiki 0095/0099/0103] Đẩy thẳng `res.data` vào state là không an toàn: nếu
      // response rỗng/khác shape thì `reviews` thành `undefined` → `reviews.length` +
      // `reviews.map` bên dưới ném TypeError. BE `/store/products/:id/reviews` trả
      // `{ data, meta, distribution }` nên `.data` đúng khoá; chỉ chuẩn hoá về mảng.
      const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      setReviews(Array.isArray(list) ? list : []);
      if (!filterRating) {
        // Chỉ cập nhật distribution khi load tất cả, để số lượng tổng không bị đổi khi filter
        setDistribution(res?.distribution ?? {});
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [productId, page, filterRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "" : "text-gray-300"} />
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">ĐÁNH GIÁ SẢN PHẨM</h3>

      {/* 1. Header Filters */}
      <div className="bg-orange-50/50 p-6 rounded-md border border-orange-100 mb-6 flex flex-col md:flex-row gap-8 items-center">
        {/* Điểm tổng quan */}
        <div className="text-center min-w-[120px]">
          <div className="text-4xl font-bold text-brand-orange">
            {/* Tính trung bình cộng từ distribution nếu cần chính xác tuyệt đối */}
            {reviews.length > 0 ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1) : 0} 
            <span className="text-lg text-gray-400 font-medium">/5</span>
          </div>
          <div className="flex justify-center mt-2 text-brand-orange">
            <Star fill="currentColor" size={20}/>
            <Star fill="currentColor" size={20}/>
            <Star fill="currentColor" size={20}/>
            <Star fill="currentColor" size={20}/>
            <Star fill="currentColor" size={20}/>
          </div>
        </div>

        {/* Các nút Filter */}
        <div className="flex-1 flex flex-wrap gap-3">
          <button 
            onClick={() => { setFilterRating(null); setPage(1); }}
            className={`px-4 py-2 border rounded-sm text-sm ${!filterRating ? 'border-brand-orange text-brand-orange bg-white' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => { setFilterRating(star); setPage(1); }}
              className={`px-4 py-2 border rounded-sm text-sm min-w-[80px] ${filterRating === star ? 'border-brand-orange text-brand-orange bg-white' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              {star} Sao ({distribution[star] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* 2. List Reviews */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500 text-center py-4">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào cho bộ lọc này.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                   <img 
                      src={review.user?.avatar || "https://ui-avatars.com/api/?name=" + review.user?.name} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                   />
                </div>

                <div className="flex-1">
                  <div className="text-xs text-gray-800 font-medium mb-1">{review.user?.name || 'Người dùng ẩn danh'}</div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  
                  {/* Ngày giờ + Phân loại hàng (nếu có) */}
                  <div className="text-xs text-gray-400 mb-3">
                    {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm')} 
                    <span className="mx-2">|</span> 
                    <span>Phân loại hàng: Mặc định</span> {/* Cần update backend trả về variant */}
                  </div>

                  {/* Nội dung comment */}
                  <div className="text-sm text-gray-700 leading-relaxed mb-3">
                    {review.content}
                  </div>

                  {/* Ảnh review (nếu có) - Mockup hiển thị */}
                  {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                          {review.images.map((img: string, idx: number) => (
                              <img key={idx} src={img} className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-90"/>
                          ))}
                      </div>
                  )}

                  {/* Reply của Seller (nếu có - cần thêm vào DB sau này) */}
                  {/* <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                      <span className="font-bold text-brand-orange">Phản hồi của Người Bán:</span> Cảm ơn bạn đã ủng hộ shop ạ!
                  </div> */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Pagination (Đơn giản) */}
      {reviews.length > 0 && (
         <div className="flex justify-end mt-4 gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
            <span className="px-3 py-1 bg-gray-100 rounded">{page}</span>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Sau</button>
         </div>
      )}
    </div>
  );
}