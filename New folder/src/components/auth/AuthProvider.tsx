"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { AuthService } from "@/services/AuthService";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initAuth = async () => {
      // Kiểm tra xem có token trong localStorage không
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Gọi API lấy thông tin user mới nhất
          const user = await AuthService.getMe();
          if (user) {
            setUser(user);
          }
        } catch (error) {
          console.error("Phiên đăng nhập hết hạn", error);
          // Nếu lỗi token (hết hạn), AuthService.getMe thường đã handle logout, 
          // nhưng an toàn thì set lại store về null
          AuthService.logout(); 
        }
      }
    };

    initAuth();
  }, [setUser]);

  // Render children bình thường, không chặn UI loading để trải nghiệm mượt hơn
  // (Header sẽ tự update khi initAuth chạy xong)
  return <>{children}</>;
}