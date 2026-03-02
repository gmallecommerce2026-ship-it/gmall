'use client'; // Chuyển thành Client Component
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PhoneIcon, QuestionMarkCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { pointService } from "@/services/point.service";
import { useUserStore } from "@/store/useUserStore";

const TopBar = () => {
  const { isAuthenticated } = useUserStore(); // Kiểm tra xem user đã login chưa
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      if (isAuthenticated) {
        try {
          const data: any = await pointService.getMyPoints();
          setPoints(data.points);
        } catch (error) {
          console.error("Failed to fetch points:", error);
        }
      }
    };

    fetchPoints();
    
    // Optional: Lắng nghe sự kiện custom nếu muốn cập nhật real-time khi check-in ở tab khác
    // window.addEventListener('POINT_UPDATED', fetchPoints);
    // return () => window.removeEventListener('POINT_UPDATED', fetchPoints);
  }, [isAuthenticated]);

  return (
    <div className="w-full bg-[#F2F2F2] h-11 hidden md:flex items-center justify-center border-b border-gray-200 z-50 relative">
      <div className="w-full max-w-[1340px] px-4 flex justify-between items-center h-full text-[15px] font-roboto font-normal text-gray-500">
        
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-300">
            <span className="text-gray-500">Hotline:</span>
            <a href="tel:19001221" className="text-[#960D76] font-medium hover:underline">
              19001221
            </a>
          </div>
          
          {/* Hiển thị điểm nếu đã đăng nhập */}
          {isAuthenticated && points !== null ? (
            <div className="flex items-center gap-2">
              <span>Điểm thưởng của bạn:</span>
              <span className="text-brand-orange font-bold">
                {points.toLocaleString()} Xu
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <span>Chào mừng đến với GMall</span>
            </div>
          )}
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-6">
          <Link href="/seller/login" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
            <QuestionMarkCircleIcon className="w-4 h-4" />
            <span>Kênh người bán</span>
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <Link href="/help" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
            <QuestionMarkCircleIcon className="w-4 h-4" />
            <span>Trợ giúp</span>
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <Link href="/policy" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Chính sách</span>
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <Link href="/contact" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
            <PhoneIcon className="w-4 h-4" />
            <span>Liên hệ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;