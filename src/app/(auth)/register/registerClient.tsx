"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, AuthInput, PrimaryButton, SocialButton } from "@/components/auth/AuthComponents";
import { OtpInput } from "@/components/auth/OtpInput";
import { AuthService } from "@/services/AuthService";
import { API_BASE_URL } from "@/lib/api/config";
import { toast } from "react-hot-toast"; // Khuyên dùng toast để thông báo đẹp hơn

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Icon Back
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const RegisterClient = () => {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  // --- SỬA 1: Gom nhóm state form ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [otpCode, setOtpCode] = useState("");
  // Wiki 0068 B2: OTP trả về từ BE khi mail chưa cấu hình (dev/staging) để vẫn verify được.
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // Clear dữ liệu cũ khi mount để user mở lại trang luôn thấy form trống
  // (audit bug Login/Register #5).
  useEffect(() => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setStep('form');
  }, []);

  // Wiki 0068 B3: hỏi BE provider OAuth nào đã cấu hình để gate nút (tránh
  // redirect sang BE rồi dính trang 503 thô khi chưa set credentials).
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!formData.name.trim()) next.name = 'Vui lòng nhập họ và tên';
    else if (formData.name.trim().length < 2) next.name = 'Họ tên quá ngắn';

    if (!formData.email.trim()) next.email = 'Vui lòng nhập email';
    else if (!EMAIL_RE.test(formData.email.trim())) next.email = 'Email không hợp lệ (cần dạng name@domain.com)';

    if (!formData.password) next.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) next.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    else if (formData.password.length > 64) next.password = 'Mật khẩu không được dài quá 64 ký tự';

    if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // --- SỬA 2: Xử lý Đăng Ký đúng luồng ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
        // Gọi API REGISTER (Gửi Name + Email + Pass)
        const res: any = await AuthService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        // Wiki 0068 B2: BE trả devOtp khi mail chưa cấu hình (dev/staging) →
        // hiển ngay để user hoàn tất đăng ký (không nhận được email).
        setDevOtp(res?.devOtp ?? null);

        // Thành công -> Chuyển sang bước OTP
        setStep('otp');
        setTimer(60);
    } catch (error: any) {
        // Backend trả lỗi (ví dụ: Email đã tồn tại). i18n từ BE (wiki 0055) đã trả tiếng Việt.
        const raw = error?.response?.data?.message;
        const msg = Array.isArray(raw) ? raw.join('\n') : (raw || 'Đăng ký thất bại. Vui lòng thử lại.');
        toast.error(msg);
    } finally {
        setIsLoading(false);
    }
  };

  // --- SỬA 3: Xử lý xác thực OTP ---
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) return;
    setIsLoading(true);
    try {
        await AuthService.verifyOtp(formData.email, otpCode);
        
        // 1. Thông báo thành công
        toast.success("Xác thực thành công! Vui lòng đăng nhập.");
        
        // 2. Clear session tạm (nếu muốn bắt buộc đăng nhập lại từ đầu)
        // AuthService.logout(); 

        // 3. Điều hướng về trang Đăng nhập
        router.push('/login'); 

    } catch (error) {
        toast.error("Mã OTP không đúng hoặc đã hết hạn.");
        setOtpCode(""); 
    } finally {
        setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res: any = await AuthService.sendOtp(formData.email);
      setDevOtp(res?.devOtp ?? null);
      setTimer(60);
      if (!res?.devOtp) toast.success("Đã gửi lại mã OTP!");
    } catch (error) {
      toast.error("Không thể gửi lại mã.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[540px] transition-all duration-500 ease-in-out">
        
        {step === 'form' && (
          <div className="flex flex-col gap-6 fade-in">
            <h1 className="text-4xl font-medium text-brand-orange text-center mb-2">
              Đăng ký
            </h1>

            <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
              <div>
                <AuthInput
                  label="Họ và tên"
                  placeholder="Nhập họ và tên"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <AuthInput
                  label="Email"
                  placeholder="Nhập email của bạn"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <AuthInput
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <AuthInput
                  label="Nhập lại mật khẩu"
                  placeholder="Xác nhận mật khẩu"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 my-2">
                <input 
                  id="terms" 
                  type="checkbox" 
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange cursor-pointer accent-orange-500" 
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed select-none">
                  Bằng việc đăng ký, bạn đồng ý với GMall về{" "}
                  <Link href="/terms" className="text-brand-orange font-medium hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  &{" "}
                  <Link href="/privacy" className="text-brand-orange font-medium hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              <div className="mt-2">
                <PrimaryButton>
                  {isLoading ? "Đang xử lý..." : "Đăng ký"}
                </PrimaryButton>
              </div>
            </form>

            <div className="flex items-center gap-4">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-gray-400 text-sm">Hoặc</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <SocialButton
                iconSrc="/assets/SvgAsset2.svg"
                label="Google"
                onClick={() => goOAuth('google')}
              />
              <SocialButton
                iconSrc="/assets/SvgAsset1.svg"
                label="Facebook"
                onClick={() => goOAuth('facebook')}
              />
            </div>

            <div className="text-center text-base">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-brand-blue font-medium hover:underline">
                Đăng nhập
              </Link>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="flex flex-col gap-8 fade-in text-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                Xác thực tài khoản
              </h1>
              <p className="text-gray-500 text-base">
                Mã xác thực 6 số đã được gửi đến email: <br/>
                <span className="font-semibold text-brand-orange">{formData.email}</span>
              </p>
              {/* Wiki 0068 B2: chế độ dev/staging — email chưa cấu hình nên hiển OTP
                  trực tiếp để hoàn tất đăng ký. Prod (có mail) sẽ KHÔNG có devOtp. */}
              {devOtp && (
                <div className="mt-4 mx-auto max-w-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="text-amber-700 font-semibold">⚠ Chế độ DEV — email chưa cấu hình</p>
                  <p className="text-amber-600 mt-1">
                    Mã OTP của bạn:{" "}
                    <span className="font-mono font-bold text-xl tracking-widest text-amber-900">{devOtp}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="py-2">
              <OtpInput 
                length={6} 
                onComplete={(code) => setOtpCode(code)} 
              />
            </div>

            <div className="flex flex-col gap-4">
              <PrimaryButton onClick={handleVerifyOtp}>
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </PrimaryButton>

              <div className="text-sm text-gray-500">
                Bạn không nhận được mã?{" "}
                {timer > 0 ? (
                  <span className="text-gray-400 font-medium">
                    Gửi lại sau {timer}s
                  </span>
                ) : (
                  <button 
                    onClick={handleResendOtp}
                    className="text-brand-orange font-medium hover:underline"
                  >
                    Gửi lại mã
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={() => setStep('form')}
              className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-orange transition-colors mx-auto"
            >
              <ArrowLeftIcon />
              Quay lại nhập thông tin
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default RegisterClient;