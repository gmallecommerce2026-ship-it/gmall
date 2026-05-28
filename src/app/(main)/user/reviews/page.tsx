'use client';
import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Star } from 'lucide-react';
import { ReviewService } from '@/services/ReviewService';
import ReviewModal from '@/components/review/ReviewModal';

type TabType = 'not-rated' | 'rated';

// Mỗi item từ BE /reviews/pending là 1 order (status DELIVERED, isReviewed=false).
// Order có items[] -> mỗi item.product = { id, name, slug, images, price }.
interface PendingOrder {
  id: string;
  code?: string;
  shopId?: string;
  shopName?: string;
  items: Array<{
    id: string;
    quantity: number;
    product: { id: string; name: string; images: string[] | string };
  }>;
}

interface MineProductReview {
  id: string;
  rating: number;
  content?: string;
  createdAt: string;
  product: { id: string; name: string; images: string[] | string };
}

const firstImage = (imgs: any) => {
  if (Array.isArray(imgs)) return imgs[0] || '';
  if (typeof imgs === 'string') return imgs;
  return '';
};

export default function ProductReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('not-rated');
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [myReviews, setMyReviews] = useState<MineProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<PendingOrder | null>(null);

  const refetchPending = async () => {
    const res = await ReviewService.getToReview();
    setPendingOrders((res.data || res) as PendingOrder[]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'not-rated') {
          await refetchPending();
        } else {
          const res = await ReviewService.getMyReviews();
          const data = res.data || res;
          setMyReviews((data.productReviews || []) as MineProductReview[]);
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đánh giá sản phẩm</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('not-rated')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'not-rated' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-brand-orange'}`}
        >
          Chưa đánh giá
        </button>
        <button
          onClick={() => setActiveTab('rated')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'rated' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-brand-orange'}`}
        >
          Đã đánh giá
        </button>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center py-8">Đang tải dữ liệu...</div>}

        {!loading && activeTab === 'not-rated' && pendingOrders.map(order => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Đơn hàng: {order.code || order.id.slice(0, 8)}</span>
              <Button className="text-sm px-5 py-2" onClick={() => setReviewingOrder(order)}>
                Viết đánh giá
              </Button>
            </div>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={firstImage(item.product.images) || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-md object-cover bg-gray-50 flex-shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!loading && activeTab === 'not-rated' && pendingOrders.length === 0 && (
          <p className="text-center text-gray-500 py-4">Bạn không có đơn hàng nào cần đánh giá.</p>
        )}

        {!loading && activeTab === 'rated' && myReviews.map(item => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
            <div className="flex gap-4 border-b border-gray-50 pb-4 mb-4">
              <img
                src={firstImage(item.product.images) || '/placeholder.png'}
                alt={item.product.name}
                className="w-16 h-16 rounded-md object-cover bg-gray-50 flex-shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 text-sm mb-1">{item.product.name}</h3>
                <p className="text-xs text-gray-500">Ngày đánh giá: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <p className="text-sm text-gray-700">{item.content}</p>
            </div>
          </div>
        ))}
        {!loading && activeTab === 'rated' && myReviews.length === 0 && (
          <p className="text-center text-gray-500 py-4">Bạn chưa đánh giá sản phẩm nào.</p>
        )}
      </div>

      {reviewingOrder && (
        <ReviewModal
          isOpen={!!reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          orderId={reviewingOrder.id}
          orderCode={reviewingOrder.code}
          shopName={reviewingOrder.shopName}
          products={reviewingOrder.items.map(it => ({
            productId: it.product.id,
            name: it.product.name,
            image: firstImage(it.product.images),
          }))}
          onSubmitted={refetchPending}
        />
      )}
    </div>
  );
}
