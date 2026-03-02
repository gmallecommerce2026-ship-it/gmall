"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Store, Eye, EyeOff, TrendingUp } from "lucide-react";

import { SellerAuthService } from "@/services/SellerAuthService";
import { useUserStore } from "@/store/useUserStore";
import Button from "@/components/ui/Button";
import { InputGroup } from "@/components/ui/InputGroup";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function SellerLoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const res = await SellerAuthService.login(data);
      
      if (res?.user) {
        // 1. Cập nhật state global
        setUser(res.user);
        
        toast.success(`Chào mừng quay lại, ${res.user.name || "Shop"}!`);
        
        router.refresh(); 
        
        router.push("/seller-dashboard"); 
      } else {
        throw new Error("Không nhận được dữ liệu người dùng.");
      }
    } catch (error: any) {
      const msg = error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* LEFT: Seller Brand Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#E78720] to-[#c4320a] relative items-center justify-center p-12 overflow-hidden text-white">
         {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Floating Effect */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl rotate-12 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full -rotate-6"></div>

        <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-3 mb-6 bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                <TrendingUp size={20} className="text-white" />
                <span className="font-medium text-sm">Tăng trưởng doanh thu +150%</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 font-sans leading-tight">
                Kênh Người Bán <br/> Chuyên Nghiệp
            </h2>
            <p className="text-orange-100 text-lg font-light leading-relaxed mb-8">
                Quản lý vận hành, tối ưu marketing và tiếp cận hàng triệu khách hàng tiềm năng chỉ với một nền tảng duy nhất.
            </p>
            
            <div className="flex gap-4">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#E78720] bg-white/20 backdrop-blur flex items-center justify-center text-xs">
                             <Store size={14}/>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center">
                    <span className="font-bold text-sm">50k+ Shop</span>
                    <span className="text-xs text-orange-200">Đang hoạt động</span>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-brand-orange mb-6">
                 <Store size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight mb-2">Đăng nhập Shop</h1>
            <p className="text-gray-500 text-sm">Quản lý cửa hàng của bạn dễ dàng hơn bao giờ hết.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputGroup
              label="Email cửa hàng"
              type="email"
              placeholder="shop@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="relative">
              <InputGroup
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
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

            <div className="flex justify-end">
               <Link href="/seller/forgot-password" className="text-sm font-semibold text-brand-orange hover:underline">
                  Quên mật khẩu?
               </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 shadow-lg shadow-orange-500/20"
              disabled={isLoading}
            >
              {isLoading ? "Đang xác thực..." : "Truy cập Dashboard"}
            </Button>
          </form>

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Bạn muốn bán hàng cùng chúng tôi?{" "}
              <Link href="/seller/register" className="font-bold text-brand-orange hover:underline">
                Đăng ký mở Shop
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}