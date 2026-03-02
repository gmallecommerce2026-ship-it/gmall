// src/app/(seller)/seller-dashboard/sellerDashboardClient.tsx
"use client";

import React from "react";
// 1. Bỏ dòng này: import OrderDashboardContainer from "@/modules/seller/orders/OrderDashboardContainer";
// 2. Import component mới:
import SellerOverview from "@/modules/seller/dashboard/SellerOverview"; 
import SellerSidebar from "@/layout/seller/SellerSidebar";

const SellerDashboardClient = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
        {/* Sidebar giữ nguyên, bọc trong div flex để layout chuẩn */}
        <SellerSidebar />
        
        {/* Phần nội dung chính */}
        <div className="flex-1 ml-[25px]"> {/* Giả định sidebar rộng 250px fixed, hoặc dùng layout chuẩn của bạn */}
            <SellerOverview />
        </div>
    </div>
  );
};

export default SellerDashboardClient;