"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, ShoppingBag, ArrowRight } from "lucide-react";

import Button from "@/components/ui/Button";
import { InputGroup } from "@/components/ui/InputGroup";
import { AuthService } from "@/services/AuthService";
import { useUserStore } from "@/store/useUserStore";

const loginSchema = z.object({
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginClient() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(data);
      if (res && (res.user || res.id)) {
         setUser(res.user || res);
         toast.success("Chào mừng bạn quay trở lại!");
         router.push("/");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* LEFT: Visual Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-50 to-orange-100 relative items-center justify-center overflow-hidden p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-300/10 rounded-full blur-[80px]" />
        </div>
        
        <div className="relative z-10 max-w-lg text-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-theme-lg flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                <ShoppingBag className="w-10 h-10 text-brand-orange" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans leading-tight">
                Khám phá thế giới <br/> <span className="text-brand-orange">quà tặng yêu thương</span>
            </h2>
            <p className="text-gray-600 text-lg font-light leading-relaxed">
                Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi riêng cho bạn.
            </p>
        </div>
      </div>

      {/* RIGHT: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">Đăng nhập</h1>
            <p className="text-gray-500 text-sm">Chào mừng quay lại! Vui lòng nhập thông tin.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputGroup
              label="Email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="relative">
              <InputGroup
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-brand-orange transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange" />
                    <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">Ghi nhớ</label>
                </div>
                <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-brand-orange hover:text-orange-700 transition-colors"
                >
                    Quên mật khẩu?
                </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}
            </Button>
          </form>

          {/* Social Login */}
          <div>
            <div className="relative flex justify-center text-sm mb-6">
              <span className="px-4 bg-white text-gray-500 z-10 font-medium">Hoặc tiếp tục với</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* OAuth redirect — BE handle full flow, FE chỉ trỏ window sang endpoint.
                  Dùng window.location.href thay vì <Link> vì destination là domain
                  BE (không phải FE route) và cần full navigation để Google set
                  cookies của mình. */}
              <button
                type="button"
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
                  window.location.href = `${apiUrl}/auth/google`;
                }}
                className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <img src="/assets/google-icon.png" alt="Google" className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
                <span className="text-sm font-semibold text-gray-700">Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
                  window.location.href = `${apiUrl}/auth/facebook`;
                }}
                className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <div className="w-5 h-5 flex items-center justify-center text-[#1877F2]">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v2.277h-2.628c-1.991 0-2.199.944-2.199 2.09v2.893h5.032l-1.357 4.925h-3.675v7.98H9.101Z"/></svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Facebook</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-brand-orange hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}