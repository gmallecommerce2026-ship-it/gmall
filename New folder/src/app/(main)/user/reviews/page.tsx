'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Star } from 'lucide-react';

type TabType = 'not-rated' | 'rated';

export default function ProductReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('not-rated');

  // Dummy data
  const notRatedItems = [
    { id: 1, name: 'Set quà tặng nến thơm Chill & Relax', variant: 'Hộp gỗ thông', date: '20/12/2024', image: 'https://i.pravatar.cc/150?u=product1' },
    { id: 2, name: 'Bình giữ nhiệt khắc tên', variant: 'Màu đen nhám', date: '19/12/2024', image: 'https://i.pravatar.cc/150?u=product2' },
  ];

  const ratedItems = [
    { 
      id: 3, 
      name: 'Gấu bông len Handmade', 
      variant: 'Size L - Nâu', 
      date: '10/12/2024', 
      image: 'https://i.pravatar.cc/150?u=product3',
      rating: 5,
      comment: 'Sản phẩm rất đẹp, đóng gói cẩn thận. Shop tư vấn nhiệt tình, sẽ ủng hộ tiếp!',
      sellerResponse: 'Cảm ơn bạn đã tin tưởng Lovegifts ạ ❤️'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đánh giá sản phẩm</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
            onClick={() => setActiveTab('not-rated')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'not-rated' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-brand-orange'}`}
        >
            Chưa đánh giá ({notRatedItems.length})
        </button>
        <button 
            onClick={() => setActiveTab('rated')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'rated' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-brand-orange'}`}
        >
            Đã đánh giá ({ratedItems.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'not-rated' && notRatedItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4 shadow-sm">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">Phân loại: {item.variant}</p>
                    <p className="text-xs text-gray-400">Giao hàng thành công ngày {item.date}</p>
                </div>
                <div className="flex flex-col justify-center">
                    <Button className="text-sm px-6 py-2">Viết đánh giá</Button>
                </div>
            </div>
        ))}

        {activeTab === 'rated' && ratedItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <div className="flex gap-4 border-b border-gray-50 pb-4 mb-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-50 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-500">Phân loại: {item.variant}</p>
                    </div>
                    <Button variant="outline" className="text-xs h-8 px-3 border-gray-200 text-gray-600">Sửa đánh giá</Button>
                </div>
                
                {/* Rating Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={`${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">Tuyệt vời</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{item.comment}</p>
                    
                    {item.sellerResponse && (
                        <div className="bg-orange-50 p-3 rounded text-xs text-gray-600">
                            <span className="font-bold text-brand-orange">Phản hồi của người bán:</span> {item.sellerResponse}
                        </div>
                    )}
                </div>
            </div>
        ))}

        {activeTab === 'rated' && ratedItems.length === 0 && (
            <div className="text-center py-10 text-gray-500">Chưa có đánh giá nào.</div>
        )}
      </div>
    </div>
  );
}