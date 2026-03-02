// src/components/modal/ReviewModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Star, UploadCloud } from 'lucide-react';
import Button from '@/components/ui/Button';
import { IOrder } from '@/services/order.service';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
  onSubmit: (data: any) => Promise<void>;
}

export default function ReviewModal({ isOpen, onClose, order, onSubmit }: ReviewModalProps) {
  const [shopRating, setShopRating] = useState(5);
  const [shopComment, setShopComment] = useState('');
  
  // State lưu đánh giá
  const [productReviews, setProductReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleProductRatingChange = (productId: string, rating: number) => {
    setProductReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const handleProductCommentChange = (productId: string, comment: string) => {
    setProductReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // [FIX QUAN TRỌNG] Map data cẩn thận hơn để tránh productId bị undefined
      const payload = {
        orderId: order.id,
        shopRating,
        shopComment,
        productReviews: order.items.map(item => {
          // Fallback: Lấy product.id, nếu không có thì lấy item.productId
          const productId = item.product?.id || (item as any).productId;
          
          if (!productId) {
             console.error("Missing Product ID for item:", item);
             // Return dummy hoặc handle error tùy ý, nhưng phải đảm bảo string
             return { productId: "", rating: 5, comment: "" }; 
          }

          return {
            productId: productId,
            rating: productReviews[productId]?.rating || 5,
            comment: productReviews[productId]?.comment || ''
          };
        }).filter(p => p.productId !== "") // Lọc bỏ item lỗi nếu có
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, size = 20 }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => setRating(star)} className="focus:outline-none" type="button">
          <Star 
            size={size} 
            className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-gray-800">Đánh giá đơn hàng</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Shop Review */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Đánh giá Shop</h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm text-gray-600">Dịch vụ của Shop:</span>
              <StarRating rating={shopRating} setRating={setShopRating} size={24} />
            </div>
            <textarea
              className="w-full border rounded-md p-3 text-sm focus:ring-1 focus:ring-brand-orange outline-none"
              placeholder="Chia sẻ trải nghiệm của bạn về Shop..."
              rows={2}
              value={shopComment}
              onChange={(e) => setShopComment(e.target.value)}
            />
          </div>

          {/* Product Reviews */}
          <div className="space-y-6">
            <h3 className="font-bold text-gray-700 border-l-4 border-brand-orange pl-3">Đánh giá sản phẩm</h3>
            {order.items.map((item, idx) => {
              // [FIX] Xác định ID sản phẩm ngay tại đây để dùng chung cho Key và State
              const productId = item.product?.id || (item as any).productId || `unknown-${idx}`;
              const productName = item.product?.name || "Sản phẩm";
              const productImg = Array.isArray(item.product?.images) 
                  ? item.product.images[0] 
                  : (item.product?.images as string) || '/assets/placeholder.png';

              return (
                <div key={item.id || idx} className="flex gap-4 border-b pb-6 last:border-0">
                  <img 
                    src={productImg} 
                    alt={productName} 
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{productName}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Chất lượng:</span>
                      <StarRating 
                        rating={productReviews[productId]?.rating || 5} 
                        setRating={(r: number) => handleProductRatingChange(productId, r)} 
                      />
                    </div>

                    <div className="relative">
                      <textarea
                        className="w-full bg-gray-50 border rounded-md p-3 text-sm focus:bg-white focus:ring-1 focus:ring-brand-orange outline-none transition-all"
                        placeholder="Sản phẩm dùng thế nào?..."
                        rows={3}
                        value={productReviews[productId]?.comment || ''}
                        onChange={(e) => handleProductCommentChange(productId, e.target.value)}
                      />
                      <div className="absolute bottom-3 right-3">
                          <UploadCloud size={16} className="text-gray-400 cursor-pointer hover:text-brand-orange"/>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Bỏ qua</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? 'Đang gửi...' : 'Hoàn thành'}
          </Button>
        </div>
      </div>
    </div>
  );
}