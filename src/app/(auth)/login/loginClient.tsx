"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Fix BUG-FE-10 (wiki 0030): centralized API_BASE_URL
import { API_BASE_URL } from "@/lib/api/config";
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
  const searchParams = useSearchParams();
  // `?next=/foo` để page guard (voucher/gift) redirect về trang gốc sau login.
  // Chỉ chấp nhận path nội bộ (bắt đầu bằng `/`) để chống open-redirect.
  const nextParam = searchParams?.get('next') || '';
  // Open-redirect guard: chỉ chấp nhận path nội bộ bắt đầu `/` mà KHÔNG phải
  // `//` hoặc `/\` (backslash trên Windows IE/Edge cũ có thể parse như authority).
  const safeNext = nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/\\')
    ? nextParam
    : '/';
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // #48: default ON → user logged-in cookie tồn tại 7 ngày (BE config). Khi
  // OFF, FE đặt sessionStorage flag và logout khi tab đóng (beforeunload).
  // Mặc định ON match expectation đa số e-commerce site.
  const [rememberMe, setRememberMe] = useState(true);

  // [round15 L2 FIX] BE OAuth callback redirect lỗi về `/login?oauth_error=...`
  // (account_locked|oauth_failed) để FE hiện toast thân thiện thay vì trước đây
  // user bị bounce về form login không rõ lý do. Đọc param → toast → strip param
  // bằng router.replace để không re-fire khi re-render / back.
  useEffect(() => {
    const oauthError = searchParams?.get('oauth_error');
    if (!oauthError) return;
    const message = oauthError === 'account_locked'
      ? 'Tài khoản đã bị khóa.'
      : 'Đăng nhập mạng xã hội thất bại, vui lòng thử lại.';
    toast.error(message);
    router.replace(safeNext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Wiki 0068 B3: hỏi BE provider OAuth nào đã cấu hình → gate nút (chưa set
  // credentials thì hiện toast thân thiện thay vì redirect dính trang 503 thô).
  const [oauth, setOauth] = useState<{ google: boolean; facebook: boolean }>({ google: true, facebook: true });
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/oauth-status`)
      .then((r) => r.json())
      .then((d) => setOauth({ google: !!d?.google, facebook: !!d?.facebook }))
      .catch(() => {});
  }, []);
  const goOAuth = (provider: 'google' | 'facebook') => {
    if (oauth[provider]) {
      window.location.href = `${API_BASE_URL}/auth/${provider}`;
    } else {
      toast.error(`Đăng nhập ${provider === 'google' ? 'Google' : 'Facebook'} chưa được cấu hình. Vui lòng dùng email & mật khẩu.`);
    }
  };

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
      // BE ignore rememberMe nếu chưa implement, không gây lỗi (dynamic key).
      const res = await AuthService.login({ ...data, rememberMe });
      if (res && (res.user || res.id)) {
         setUser(res.user || res);
         // Lưu flag để Logout-on-close hook biết khi nào cần auto-logout.
         try {
           if (rememberMe) {
             localStorage.setItem('gmall:remember', '1');
             sessionStorage.removeItem('gmall:logout-on-close');
           } else {
             localStorage.removeItem('gmall:remember');
             sessionStorage.setItem('gmall:logout-on-close', '1');
           }
         } catch { /* storage có thể fail trong incognito */ }
         toast.success("Chào mừng bạn quay trở lại!");
         router.push(safeNext);
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
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                    />
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
                onClick={() => goOAuth('google')}
                className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700">Google</span>
              </button>
              <button
                type="button"
                onClick={() => goOAuth('facebook')}
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