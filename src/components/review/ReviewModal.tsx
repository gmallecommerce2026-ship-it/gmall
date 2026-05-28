'use client';
import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ReviewService } from '@/services/ReviewService';

interface ProductItem {
  productId: string;
  name: string;
  image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  shopName?: string;
  products: ProductItem[];
  onSubmitted?: () => void;
}

const StarRow = ({ value, onChange, size = 24 }: { value: number; onChange: (v: number) => void; size?: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110"
        aria-label={`${n} sao`}
      >
        <Star
          size={size}
          className={n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      </button>
    ))}
  </div>
);

export default function ReviewModal({ isOpen, onClose, orderId, orderCode, shopName, products, onSubmitted }: Props) {
  const [shopRating, setShopRating] = useState(5);
  const [shopComment, setShopComment] = useState('');
  const [productRatings, setProductRatings] = useState<Record<string, { rating: number; comment: string }>>(
    Object.fromEntries(products.map(p => [p.productId, { rating: 5, comment: '' }])),
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const setProductField = (pid: string, patch: Partial<{ rating: number; comment: string }>) => {
    setProductRatings(prev => ({ ...prev, [pid]: { ...prev[pid], ...patch } }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await ReviewService.submitOrderReview({
        orderId,
        shopRating,
        shopComment: shopComment.trim() || undefined,
        productReviews: products.map(p => ({
          productId: p.productId,
          rating: productRatings[p.productId]?.rating || 5,
          comment: productRatings[p.productId]?.comment.trim() || undefined,
        })),
      });
      toast.success('Cảm ơn bạn đã đánh giá!');
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Đánh giá đơn hàng</h2>
            {orderCode && <p className="text-xs text-gray-500">Mã đơn: {orderCode}</p>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="border border-gray-100 rounded-xl p-4 bg-orange-50/40">
            <h3 className="font-semibold text-gray-800 mb-2">Đánh giá shop {shopName || ''}</h3>
            <StarRow value={shopRating} onChange={setShopRating} />
            <textarea
              value={shopComment}
              onChange={e => setShopComment(e.target.value)}
              rows={2}
              placeholder="Chia sẻ về dịch vụ của shop..."
              className="mt-3 w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>

          {products.map(p => {
            const cur = productRatings[p.productId] || { rating: 5, comment: '' };
            return (
              <div key={p.productId} className="border border-gray-100 rounded-xl p-4">
                <div className="flex gap-3 mb-3">
                  {p.image && <img src={p.image} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-gray-50" />}
                  <h3 className="font-semibold text-gray-800 flex-1">{p.name}</h3>
                </div>
                <StarRow value={cur.rating} onChange={v => setProductField(p.productId, { rating: v })} />
                <textarea
                  value={cur.comment}
                  onChange={e => setProductField(p.productId, { comment: e.target.value })}
                  rows={2}
                  placeholder="Chia sẻ về sản phẩm..."
                  className="mt-3 w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-orange"
                />
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Huỷ</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
