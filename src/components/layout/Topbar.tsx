'use client'; 
import React, { useEffect } from "react"; // Bỏ useState
import Link from "next/link";
import { PhoneIcon, QuestionMarkCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { pointService } from "@/services/point.service";
import { useUserStore } from "@/store/useUserStore";

const TopBar = () => {
  // Lấy user và hàm updatePoint từ store
  const { isAuthenticated, user, updatePoint } = useUserStore(); 
  
  // Lấy điểm từ user trong store (ưu tiên)
  const displayPoints = user?.point || 0;

  useEffect(() => {
    const fetchPoints = async () => {
      if (isAuthenticated) {
        try {
          const data: any = await pointService.getMyPoints();
          // Cập nhật vào Store thay vì state cục bộ
          // Kiểm tra kỹ cấu trúc response API trả về (data.points hay data.point)
          if (data && typeof data.points === 'number') {
             updatePoint(data.points);
          }
        } catch (error) {
          console.error("Failed to fetch points:", error);
        }
      }
    };

    fetchPoints();
    
    // Nếu bạn có cơ chế event, giữ nguyên
    // window.addEventListener('POINT_UPDATED', fetchPoints);
    // return () => window.removeEventListener('POINT_UPDATED', fetchPoints);
  }, [isAuthenticated, updatePoint]); // Thêm updatePoint vào dependency

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
          
          {/* Hiển thị điểm từ Store */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span>Điểm thưởng của bạn:</span>
              <span className="text-brand-orange font-bold">
                {displayPoints.toLocaleString()} Xu
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <span>Chào mừng đến với GMall</span>
            </div>
          )}
        </div>

        {/* Right Side: Links (Giữ nguyên) */}
        <div className="flex items-center gap-6">
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