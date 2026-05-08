'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { FileText, Search, Store, Truck, Loader2, Coins, X } from 'lucide-react';
import { OrderService, IOrder } from '@/services/order.service';
import toast from 'react-hot-toast';
import ReviewModal from '@/components/modal/ReviewModal';
import { useUserStore } from '@/store/useUserStore'; // [IMPORT ZUSTAND]
import { useCartStore } from '@/store/useCartStore';

// --- COMPONENT POPUP NHẬN XU ---
const CoinRewardPopup = ({ points, onClose }: { points: number; onClose: () => void }) => {
  if (!points) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center relative animate-scale-up border-4 border-yellow-100">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
           <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-20"></div>
           <Coins size={48} className="text-yellow-600 drop-shadow-sm" />
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">Tuyệt vời!</h3>
        <p className="text-gray-500 mb-6">Bạn vừa nhận được phần thưởng</p>
        
        <div className="bg-yellow-50 py-3 rounded-xl border border-yellow-200 mb-6 flex flex-col items-center justify-center">
           <div className="flex items-baseline gap-1">
             <span className="text-4xl font-black text-yellow-600 drop-shadow-sm">+{points}</span>
             <span className="text-sm font-bold text-yellow-700">Xu</span>
           </div>
           <span className="text-xs text-yellow-600/70 mt-1">Đã cộng vào ví xu của bạn</span>
        </div>

        <Button 
          onClick={onClose} 
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold shadow-lg shadow-yellow-200 border-none h-12 text-base"
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    </div>
  );
};

// --- CẤU HÌNH TABS ---
const TABS = [
  { id: 'all', label: 'Tất cả', status: 'all' },
  { id: 'pending', label: 'Chờ xác nhận', status: 'PENDING' },
  { id: 'waiting', label: 'Chờ giao hàng', status: 'CONFIRMED' },
  { id: 'shipping', label: 'Vận chuyển', status: 'SHIPPING' },
  { id: 'completed', label: 'Hoàn thành', status: 'DELIVERED' },
  { id: 'cancelled', label: 'Đã hủy', status: 'CANCELLED' },
];

const STATUS_TEXT_MAP: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đang xử lý',
  SHIPPING: 'Đang vận chuyển',
  DELIVERED: 'Giao hàng thành công',
  CANCELLED: 'Đã hủy',
};

// --- MAIN PAGE COMPONENT ---
export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  
  // States cho tính năng Review & Reward
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<IOrder | null>(null);
  const [rewardCoins, setRewardCoins] = useState<number | null>(null);
  const [pendingPurchasePoints, setPendingPurchasePoints] = useState<number>(0); // [NEW] Lưu xu tạm từ đơn hàng

  const { updatePoint } = useUserStore(); // [NEW] Zustand Store
  const addToCart = useCartStore((s) => s.addToCart);
  const router = useRouter();

  // B5.3: "Mua lại" — thêm tất cả SP của đơn cũ vào cart rồi chuyển /cart.
  // Dùng Promise.all để add song song; bỏ qua item lỗi (ví dụ SP đã ngừng bán).
  const handleBuyAgain = async (order: IOrder) => {
    if (!order.items?.length) {
      toast.error('Đơn hàng không còn sản phẩm');
      return;
    }
    const toastId = toast.loading('Đang thêm sản phẩm vào giỏ...');
    try {
      await Promise.all(
        order.items.map((item: any) =>
          addToCart(
            {
              id: item.productId,
              productId: item.productId,
              productVariantId: item.productVariantId,
              name: item.name || item.title,
              title: item.name || item.title,
              imageUrl: item.imageUrl,
              price: item.price,
            } as any,
            item.quantity || 1,
          ).catch((err) => {
            console.warn('Item buy-again fail:', item.productId, err);
          }),
        ),
      );
      toast.success('Đã thêm vào giỏ hàng', { id: toastId });
      router.push('/cart');
    } catch (err) {
      toast.error('Không thể mua lại. Vui lòng thử lại.', { id: toastId });
    }
  };

  // 1. Fetch data đơn hàng
  // hooks-fix wiki 0031: useCallback wrapping for stable effect dep
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const currentTab = TABS.find(t => t.id === activeTab);
      const statusParam = currentTab?.status;
      const data = await OrderService.getMyOrders(statusParam);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 2. Xử lý hủy đơn
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    setCancelingId(orderId);
    try {
      await OrderService.cancelOrder(orderId);
      toast.success('Đã hủy đơn hàng thành công');
      fetchOrders(); 
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setCancelingId(null);
    }
  };

  // 3. [NEW LOGIC] Xử lý "Đã nhận được hàng"
  const handleConfirmReceived = async (order: IOrder) => {
    if (!window.confirm('Xác nhận bạn đã nhận được đầy đủ hàng và muốn hoàn tất đơn này?')) return;

    const toastId = toast.loading('Đang xử lý...');
    try {
      // Lúc này 'res' đã có kiểu IOrderActionResponse (nhờ sửa ở service)
      const res: any = await OrderService.confirmReceived(order.id);
      
      // Không cần .data nữa vì service đã return .data rồi
      const earned = res.earnedPoints || 0; 
      
      setPendingPurchasePoints(earned);

      if (res.newBalance !== undefined) {
         updatePoint(res.newBalance);
      }

      toast.success('Xác nhận thành công! Hãy đánh giá để nhận thêm xu.', { id: toastId });
      
      await fetchOrders(); 
      setSelectedOrderForReview(order); 

    } catch (error: any) {
      // Xử lý lỗi từ Axios (thường message nằm trong error.response.data.message)
      const msg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      toast.error(msg, { id: toastId });
    }
  };

  // 4. [UPDATED LOGIC] Submit Review & Gộp Xu Thưởng
  const handleReviewSubmit = async (data: any) => {
    try {
        // A. Gọi API submit review
        const res: any = await OrderService.submitReview(data); 
        
        setSelectedOrderForReview(null);

        // B. Lấy xu thưởng từ việc Review
        const earnedFromReview = Number(res?.earnedPoints || 0);

        // C. Cập nhật Ví Xu lần 2 (nếu có thay đổi sau khi review)
        if (res.newBalance !== undefined) {
            updatePoint(res.newBalance);
        }

        // D. Tổng kết xu: (Xu đơn hàng) + (Xu đánh giá)
        const totalReward = pendingPurchasePoints + earnedFromReview;

        if (totalReward > 0) {
            setRewardCoins(totalReward); // Hiện Popup tổng
        } else {
            toast.success('Cảm ơn bạn đã đánh giá!');
        }
        
        // Reset biến tạm
        setPendingPurchasePoints(0);
        fetchOrders();
    } catch (error: any) {
        toast.error('Có lỗi khi gửi đánh giá');
        console.error(error);
    }
  };

  const getProductImage = (images: string | string[]): string => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') return images;
    return 'https://placehold.co/100';
  };

  return (
    <div className="bg-gray-50 min-h-[500px]">
      
      {/* POPUP NHẬN XU */}
      {rewardCoins && (
          <CoinRewardPopup 
            points={rewardCoins} 
            onClose={() => setRewardCoins(null)} 
          />
      )}

      {/* Tabs Header */}
      <div className="bg-white sticky top-0 z-10 rounded-t-xl shadow-sm">
        <div className="flex w-full overflow-x-auto no-scrollbar border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center border-b-2 transition-colors duration-300 ${
                activeTab === tab.id
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-600 hover:text-brand-orange'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 bg-gray-50/50">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo Tên Shop, ID Đơn hàng hoặc Tên Sản phẩm"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-brand-orange focus:bg-white transition-all outline-none"
                />
            </div>
        </div>
      </div>

      {/* Orders List Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
            <span className="text-gray-500 text-sm">Đang tải đơn hàng...</span>
          </div>
        ) : orders.length > 0 ? (
             orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-fade-in hover:shadow-md transition-shadow">
                    {/* Header đơn hàng */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="bg-brand-orange text-white text-[10px] font-bold px-1 py-0.5 rounded">Mall</span>
                            <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
                                <Store size={14} className="text-gray-500"/> 
                                {order.shopName || 'G-Mall Official'} 
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-brand-orange text-sm font-medium">
                            <Truck size={16} />
                            <span className="uppercase">{STATUS_TEXT_MAP[order.status] || order.status}</span>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="space-y-4">
                        {order.items.map((item, idx) => {
                            const product = item.product;
                            if (!product) return null; // Handle null product

                            return (
                                <Link 
                                    href={`/product-details/${product.slug}`} 
                                    key={item.id || idx} 
                                    className="flex gap-4 group"
                                >
                                    <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded-md overflow-hidden bg-gray-50 relative">
                                        <img 
                                            src={getProductImage(product.images)} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-brand-orange transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-500 text-xs mb-1">Số lượng: x{item.quantity}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-brand-orange text-sm font-medium">
                                            {item.price.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer & Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-end items-center gap-2 mb-4">
                            <span className="text-gray-600 text-sm">Thành tiền:</span>
                            <span className="text-brand-orange text-xl font-bold">
                                {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                            </span>
                        </div>
                        
                        <div className="flex justify-end items-center gap-3">
                            
                            {/* Nút Hủy (PENDING) */}
                            {order.status === 'PENDING' && (
                                <Button 
                                  variant="outline" 
                                  className="text-red-500 border-red-200 hover:bg-red-50 !h-9"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancelingId === order.id}
                                >
                                    {cancelingId === order.id ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Hủy đơn hàng'}
                                </Button>
                            )}
                            
                            {/* Nút Đánh giá/Mua lại (DELIVERED) */}
                            {order.status === 'DELIVERED' && (
                                <>
                                    {!order.isReviewed ? (
                                        <Button 
                                            onClick={() => setSelectedOrderForReview(order)} 
                                            className="!px-6 !py-2 !text-sm !h-10"
                                        >
                                            Đánh giá ngay
                                        </Button>
                                    ) : (
                                        <Button variant="outline" disabled className="!px-6 !py-2 !text-sm !h-10 opacity-60">
                                            Đã đánh giá
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => handleBuyAgain(order)}
                                        className="!px-8 !py-2 !text-sm !h-10 bg-brand-orange/10 text-brand-orange border border-brand-orange hover:bg-brand-orange hover:text-white"
                                    >
                                        Mua lại
                                    </Button>
                                </>
                            )}
                             
                            {/* Nút Đã nhận hàng (SHIPPING/CONFIRMED) */}
                            {(order.status === 'SHIPPING' || order.status === 'CONFIRMED') && (
                                <Button 
                                    onClick={() => handleConfirmReceived(order)} // [UPDATED] Gọi hàm mới
                                    variant="secondary" 
                                    className="!px-6 !py-2 !text-sm !h-10 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white transition-colors border border-brand-orange"
                                >
                                    Đã nhận được hàng
                                </Button>
                            )}

                             {/* Trạng thái Hủy */}
                             {order.status === 'CANCELLED' && (
                                <Button variant="secondary" className="!px-6 !py-2 !text-sm !h-10" disabled>
                                    Đã hủy
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
             ))
        ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-600 font-medium">Chưa có đơn hàng nào</p>
                <Link href="/" className="mt-4 text-brand-orange hover:underline text-sm">
                    Tiếp tục mua sắm
                </Link>
            </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedOrderForReview && (
            <ReviewModal 
                isOpen={!!selectedOrderForReview}
                onClose={() => setSelectedOrderForReview(null)}
                order={selectedOrderForReview}
                onSubmit={handleReviewSubmit}
            />
        )}
    </div>
  );
}