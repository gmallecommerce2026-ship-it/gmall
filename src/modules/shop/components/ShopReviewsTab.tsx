'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageCircle, ShoppingBag, Calendar } from 'lucide-react';
import { ShopService } from '@/services/shop.service';
import { format } from 'date-fns';

export default function ShopReviewsTab({ shopId }: { shopId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await ShopService.getReviews(shopId, { page: 1 });
        // [FIX wiki 0095/0099/0103] `setReviews(res.data)` cũ đẩy thẳng giá trị chưa
        // kiểm tra vào state: nếu response rỗng/không đúng shape thì `reviews` thành
        // `undefined` → `reviews.map` bên dưới ném TypeError và cả tab trắng.
        // BE `/shops/:id/reviews` trả `{ data, meta, stats }`, nên `.data` là khoá đúng;
        // chỉ bọc thêm để state LUÔN là mảng.
        const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        setReviews(Array.isArray(list) ? list : []);
        setStats(res?.stats ?? null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shopId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu shop...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Cột trái: Thống kê Shop */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Star className="text-brand-orange" size={20}/>
              <h3 className="font-bold text-gray-700">Đánh giá Shop</h3>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Đánh giá trung bình</span>
                  <span className="font-bold text-brand-orange text-lg">
                      {Number(stats?.avgRating || 0).toFixed(1)}/5.0
                  </span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tổng đánh giá</span>
                  <span className="font-medium">{stats?.totalReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tỉ lệ phản hồi</span>
                  <span className="font-medium text-blue-600">{stats?.responseRate || 100}%</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tham gia</span>
                  <span className="font-medium text-xs">
                    {stats?.joinDate ? format(new Date(stats.joinDate), 'dd/MM/yyyy') : 'N/A'}
                  </span>
              </div>
           </div>
        </div>
      </div>

      {/* Cột phải: Danh sách Review */}
      <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-gray-500"/> 
            Lịch sử đánh giá từ người mua
         </h3>
         
         <div className="space-y-6">
            {reviews.map((review) => (
               <div key={review.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                  <img 
                      src={review.user?.avatar || "https://ui-avatars.com/api/?name=" + review.user?.name} 
                      className="w-10 h-10 rounded-full bg-gray-100"
                  />
                  <div className="flex-1">
                      <div className="flex justify-between items-start">
                          <span className="text-sm font-medium">{review.user?.name}</span>
                          <span className="text-xs text-gray-400">{format(new Date(review.createdAt), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < review.rating ? "#facc15" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}/>
                          ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.content}</p>
                      
                      {/* Sản phẩm đã mua trong review này */}
                      {review.orderId && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-500 hover:bg-gray-100 cursor-pointer">
                             <ShoppingBag size={12}/> Đơn hàng #{review.orderId.slice(0, 8)}
                          </div>
                      )}
                  </div>
               </div>
            ))}

            {reviews.length === 0 && <p className="text-center text-gray-400">Shop chưa có đánh giá nào.</p>}
         </div>
      </div>
    </div>
  );
}