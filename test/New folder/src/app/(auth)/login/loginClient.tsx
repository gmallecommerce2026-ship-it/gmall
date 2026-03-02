"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Facebook, Mail } from "lucide-react";

import Button from "@/components/ui/Button";
import { InputGroup } from "@/components/ui/InputGroup";
import { AuthService } from "@/services/AuthService"; // Import Service
import { useUserStore } from "@/store/useUserStore";

// --- Schema Validate ---
const loginSchema = z.object({
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginClient() {
  const router = useRouter();
  const { setUser } = useUserStore(); // Store Zustand
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);
    try {
      // Call service
      const res = await AuthService.login({
        email: data.email,
        password: data.password
      });
      
      // Check for user data. Depending on your backend, it might be in res.data or res.user
      // If AuthService returns response.data, and backend returns { user: {...}, access_token: ... }
      if (res && (res.user || res.id)) { // Adjust check based on actual backend response
         const userData = res.user || res; // Fallback
         setUser(userData);
         toast.success("Đăng nhập thành công!");
         router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      // Axios errors have a specific structure
      const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
        <p className="text-gray-500">Đăng nhập để tiếp tục mua sắm</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputGroup
          label="Email"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register("email")}
          // icon={<Mail size={18} />}
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
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-orange hover:text-orange-600 transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          className="shadow-lg shadow-orange-500/20"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <img src="/assets/google-icon.png" alt="Google" className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Facebook className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Facebook</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-brand-orange hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}