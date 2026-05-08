"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";
import toast from "react-hot-toast";

import { useUserStore } from "@/store/useUserStore";
import { AdminService } from "@/services/AdminService";
import Button from "@/components/ui/Button";
import { InputGroup } from "@/components/ui/InputGroup";
import { BRAND } from "@/lib/brand";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: "", password: "" }
  });

  const handleAdminLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await AdminService.login(data.email, data.password);
      
      if (res?.user) {
         if (res.user.role !== 'ADMIN') {
            toast.error("Bạn không có quyền truy cập hệ thống!");
            return;
         }
         setUser(res.user);
         toast.success("Xin chào Quản trị viên!");
         router.push("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error("Sai tài khoản hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* LEFT: Admin Visual Section (Blue Brand Color) */}
      <div className="hidden lg:flex w-1/2 bg-brand-500 relative items-center justify-center p-12 overflow-hidden">
        {/* Geometric Tech Background */}
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-600 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 text-center text-white">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <ShieldCheck className="w-12 h-12 text-white" />
             </div>
             <h2 className="text-3xl font-bold uppercase tracking-widest font-sans mb-4">Administrator</h2>
             <div className="h-1 w-20 bg-brand-300 mx-auto mb-6 rounded-full"></div>
             <p className="text-brand-100 font-light max-w-xs mx-auto">
                Hệ thống quản trị tập trung. Vui lòng bảo mật thông tin tài khoản tuyệt đối.
             </p>
        </div>
      </div>

      {/* RIGHT: Admin Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-gray-50">
        <div className="w-full max-w-[420px] bg-white p-8 md:p-10 rounded-3xl shadow-theme-xl border border-gray-100">
             <div className="text-center mb-8">
                 <h1 className="text-2xl font-bold text-gray-900 font-sans">Đăng nhập hệ thống</h1>
                 <p className="text-gray-400 text-xs mt-2 uppercase tracking-wide">Chỉ dành cho nhân viên nội bộ</p>
             </div>

             <form onSubmit={handleSubmit(handleAdminLogin)} className="space-y-6">
                 <InputGroup
                    label="Email quản trị"
                    type="email"
                    placeholder={BRAND.adminEmail}
                    {...register("email", { required: "Vui lòng nhập email" })}
                    error={errors.email?.message as string}
                 />

                 <div className="relative">
                    <InputGroup
                        label="Mật khẩu"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                        error={errors.password?.message as string}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-gray-400 hover:text-brand-500 transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>

                 {/* Custom Admin Button styling to override the default Orange */}
                 <Button 
                    type="submit"
                    className="w-full h-12 !bg-brand-500 hover:!bg-brand-600 focus:!ring-brand-200 shadow-lg shadow-brand-500/30 text-white"
                    disabled={isLoading}
                 >
                     <span className="flex items-center gap-2">
                        <Lock size={18} />
                        {isLoading ? "Đang xác thực..." : "Truy cập Dashboard"}
                     </span>
                 </Button>
             </form>
             
             <div className="mt-8 text-center">
                 <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                    <ShieldCheck size={14} />
                    Kết nối an toàn với mã hóa SSL
                 </p>
             </div>
        </div>
      </div>
    </div>
  );
}