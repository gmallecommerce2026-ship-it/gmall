// src/app/(seller)/seller-dashboard/page.tsx
"use client";

import React from "react";
import OrderDashboardContainer from "@/modules/seller/orders/OrderDashboardContainer";
import SellerSidebar from "@/layout/seller/SellerSidebar";

const SellerDashboardClient = () => {
  return (
    <>
        <OrderDashboardContainer />
        <SellerSidebar />
    </>
  );
};

export default SellerDashboardClient;