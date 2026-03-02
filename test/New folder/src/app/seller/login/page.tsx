// src/app/seller/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Store, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

import { SellerAuthService } from "@/services/SellerAuthService";
import { useUserStore } from "@/store/useUserStore";

// Schema Validation
const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function SellerLoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      // Gọi service
      const res = await SellerAuthService.login(data);

      // SỬA LỖI LOGIC REDIRECT:
      // Kiểm tra xem có object 'user' trả về không (thay vì check token)
      if (res?.user) {
        // 1. Cập nhật Store
        setUser(res.user);
        
        // 2. Thông báo & Redirect
        toast.success(`Chào mừng quay lại, ${res.user.name || "Shop"}!`);
        
        // Đợi 1 chút để toast hiện lên (tuỳ chọn) hoặc redirect luôn
        router.push("/seller-dashboard"); 
      } else {
        // Trường hợp API 200 OK nhưng không trả về user đúng cấu trúc
        throw new Error("Không nhận được dữ liệu người dùng.");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      // Lấy message lỗi từ Backend trả về (nếu có)
      const msg = error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Hero/Image */}
        <div className="md:w-1/2 bg-brand-orange/10 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern-bg.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
              <Store className="w-10 h-10 text-brand-orange" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Kênh Người Bán</h2>
            <p className="text-gray-600">Quản lý đơn hàng, sản phẩm và doanh thu của bạn tại một nơi duy nhất.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-sm text-gray-500 mt-1">Truy cập vào trang quản trị shop của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                  } outline-none transition-all`}
                  placeholder="name@example.com"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link href="/seller/forgot-password" className="text-xs font-medium text-brand-orange hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.password ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                  } outline-none transition-all`}
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.password && <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-brand-orange hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              ) : (
                <>
                  Đăng nhập <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản bán hàng?{" "}
              <Link href="/seller/register" className="font-semibold text-brand-orange hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}