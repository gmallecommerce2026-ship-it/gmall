// src/app/(seller)/seller-dashboard/sellerDashboardClient.tsx
"use client";

import React from "react";
import SellerOverview from "@/modules/seller/dashboard/SellerOverview";

// wiki 0110: trước đây file này render THÊM một <SellerSidebar /> nữa, trong khi
// `(seller)/layout.tsx` đã render một cái rồi. Cả hai đều `position: fixed` cùng toạ độ
// nên chồng khít lên nhau — nhìn không ra, nhưng mỗi lần vào trang là gọi đôi
// `/admin/dashboard/seller/stats` và chạy đôi interval 60s. Kèm theo là
// `<div className="flex-1 ml-[25px]">` với chú thích "giả định sidebar rộng 250px" —
// thiếu một số 0, và dù có đúng 250 thì cũng thừa, vì layout đã đẩy nội dung bằng
// `lg:ml-[260px]`. Nay trang chỉ còn phần nội dung của chính nó.
const SellerDashboardClient = () => {
  return <SellerOverview />;
};

export default SellerDashboardClient;
