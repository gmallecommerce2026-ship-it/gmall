'use client';
import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Star } from 'lucide-react';
import { ReviewService } from '@/services/ReviewService'; // Đã tạo ở trên

type TabType = 'not-rated' | 'rated';

export default function ProductReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('not-rated');
  const [notRatedItems, setNotRatedItems] = useState<any[]>([]);
  const [ratedItems, setRatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'not-rated') {
                const res = await ReviewService.getToReview();
                setNotRatedItems(res.data || []);
            } else {
                const res = await ReviewService.getMyReviews();
                setRatedItems(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đánh giá sản phẩm</h1>
      
      {/* Tabs */}
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

      {/* Content */}
      <div className="space-y-4">
        {loading && <div className="text-center py-8">Đang tải dữ liệu...</div>}

        {!loading && activeTab === 'not-rated' && notRatedItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4 shadow-sm">
                <img src={item.productImage || 'https://via.placeholder.com/150'} alt={item.productName} className="w-20 h-20 rounded-md object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{item.productName}</h3>
                    <p className="text-sm text-gray-500 mb-1">Phân loại: {item.variantName}</p>
                    <p className="text-xs text-gray-400">Đơn hàng: {item.orderCode}</p>
                </div>
                <div className="flex flex-col justify-center">
                    <Button className="text-sm px-6 py-2">Viết đánh giá</Button>
                </div>
            </div>
        ))}
        {!loading && activeTab === 'not-rated' && notRatedItems.length === 0 && <p className="text-center text-gray-500 py-4">Bạn không có đơn hàng nào cần đánh giá.</p>}

        {!loading && activeTab === 'rated' && ratedItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <div className="flex gap-4 border-b border-gray-50 pb-4 mb-4">
                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-md object-cover bg-gray-50 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-sm mb-1">{item.productName}</h3>
                        <p className="text-xs text-gray-500">Ngày đánh giá: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    {/* <Button variant="outline" className="text-xs h-8 px-3 border-gray-200 text-gray-600">Sửa</Button> */}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={`${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{item.comment}</p>
                    
                    {item.sellerResponse && (
                        <div className="bg-orange-50 p-3 rounded text-xs text-gray-600">
                            <span className="font-bold text-brand-orange">Phản hồi của shop:</span> {item.sellerResponse}
                        </div>
                    )}
                </div>
            </div>
        ))}
         {!loading && activeTab === 'rated' && ratedItems.length === 0 && <p className="text-center text-gray-500 py-4">Bạn chưa đánh giá sản phẩm nào.</p>}
      </div>
    </div>
  );
}