// src/modules/product-details/components/ShopInfo.tsx
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useUserStore } from "@/store/useUserStore";
import { useChatStore } from "@/store/useChatStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ShopProfileData {
  id: string;
  name: string;
  avatarUrl: string;
  isOfficial: boolean;
  lastActive: string;
  stats: {
    rating: number;
    productsCount: number;
    responseRate: number;
    joinedDate: string;
    followerCount: number;
  }
}

interface ShopInfoProps {
  shop: ShopProfileData | null;
}

const ShopInfo: React.FC<ShopInfoProps> = ({ shop }) => {
  const router = useRouter();
  const { user } = useUserStore();
  const { openChatWithSeller } = useChatStore();
  
  // [FIX] State để quản lý nguồn ảnh, tránh lỗi 404 liên tục
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (shop) {
      setImgSrc(shop.avatarUrl);
    }
  }, [shop]);

  if (!shop) return null;

  // [FIX] Safe access stats và convert Number cho rating
  const stats = shop.stats || {
      rating: 5.0,
      productsCount: 0,
      responseRate: 100,
      joinedDate: 'N/A',
      followerCount: 0
  };

  const displayRating = Number(stats.rating || 0).toFixed(1);

  // Hàm xử lý khi ảnh bị lỗi (404)
  const handleImageError = () => {
    // Chuyển sang ảnh tạo tự động từ tên Shop
    setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=f3f4f6&color=6b7280`);
  };

  const handleChat = async () => {
    if (!user) {
       router.push(`/login?redirect=/shop/${shop.id}`);
       return;
    }
    if (user.id === shop.id) return;
    await openChatWithSeller(shop.id, shop.name, imgSrc || shop.avatarUrl);
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
      {/* LEFT: Avatar & Name */}
      <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto border-b md:border-b-0 pb-4 md:pb-0 md:border-r border-gray-100 md:pr-8">
        <div className="relative">
          <img
            src={imgSrc || `https://ui-avatars.com/api/?name=${shop.name}`} 
            alt={shop.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-gray-100 object-cover"
            onError={handleImageError} // [FIX] Bắt lỗi 404 tại đây
          />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {shop.name} 
              {shop.isOfficial && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Mall</span>
              )}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              Online {shop.lastActive ? "vừa xong" : ""}
            </span>
          </div>

          <div className="flex gap-2 mt-1">
            <Button 
              onClick={handleChat} 
              variant="secondary" 
              className="px-4 py-1.5 text-xs md:text-sm bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-all font-medium flex items-center"
            >
              <i className="fas fa-comment-dots mr-2"></i>
              Chat Ngay
            </Button>
            
            <Link href={`/shop/${shop.id}`}>
                <Button
                variant="outline"
                className="px-4 py-1.5 text-xs md:text-sm border-gray-300 text-gray-600 hover:bg-gray-50 font-medium flex items-center"
                >
                <i className="fas fa-store mr-2"></i>
                Xem Shop
                </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT: Stats */}
      {shop.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 flex-1 w-full pl-0 md:pl-4">
            <div className="text-sm flex justify-between md:justify-start gap-3">
                <span className="text-gray-500">Đánh giá:</span>
                <span className="font-semibold text-orange-600">{displayRating} / 5.0</span>
            </div>
            <div className="text-sm flex justify-between md:justify-start gap-3">
            <span className="text-gray-500">Sản phẩm:</span>
            <span className="font-semibold text-orange-600">{formatNumber(shop.stats.productsCount)}</span>
            </div>
            <div className="text-sm flex justify-between md:justify-start gap-3">
            <span className="text-gray-500">Tỉ lệ phản hồi:</span>
            <span className="font-semibold text-orange-600">{shop.stats.responseRate ?? 100}%</span>
            </div>
            <div className="text-sm flex justify-between md:justify-start gap-3">
            <span className="text-gray-500">Tham gia:</span>
            <span className="font-semibold text-orange-600">{shop.stats.joinedDate}</span>
            </div>
            <div className="text-sm flex justify-between md:justify-start gap-3">
            <span className="text-gray-500">Người theo dõi:</span>
            <span className="font-semibold text-orange-600">{formatNumber(shop.stats.followerCount)}</span>
            </div>
        </div>
      )}
    </div>
  );
}

export default ShopInfo;