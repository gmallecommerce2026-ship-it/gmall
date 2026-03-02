// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { AuthService } from "@/services/AuthService";

// [FIX] Thêm các đường dẫn public của Seller vào danh sách này
const PUBLIC_PATHS = [
  "/login", 
  "/register", 
  "/forgot-password", 
  "/reset-password",
  // Thêm các route auth của seller:
  "/seller/login",
  "/seller/register",
  "/seller/forgot-password",
  "/admin/login" // Nên thêm cả admin nếu có
];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
          const user = await AuthService.getMe();
          if (user) {
            setUser(user);
          } else {
             // Nếu không có user, chỉ logout nếu KHÔNG phải là trang public
             if (!PUBLIC_PATHS.includes(pathname)) {
                 AuthService.logout(); 
             }
          }
      } catch (error) {
          // Nếu lỗi auth và KHÔNG phải trang public thì mới logout
          if (!PUBLIC_PATHS.includes(pathname)) {
              AuthService.logout();
          } else {
              console.log("Guest visiting public page: ", pathname);
          }
      }
    };

    // Chỉ chạy check nếu chưa có state user
    if (!isAuthenticated) {
        initAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser]); 

  return <>{children}</>;
}