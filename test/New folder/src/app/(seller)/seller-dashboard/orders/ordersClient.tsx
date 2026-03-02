// src/app/(seller)/seller-dashboard/page.tsx
"use client";

import React from "react";
import OrderDashboardContainer from "@/modules/seller/orders/OrderDashboardContainer";

const OrdersClient = () => {
  return (
    <>
        <OrderDashboardContainer />
    </>
  );
};

export default OrdersClient;