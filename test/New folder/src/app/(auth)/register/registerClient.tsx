"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout, AuthInput, PrimaryButton, SocialButton } from "@/components/auth/AuthComponents";
import { OtpInput } from "@/components/auth/OtpInput";
import { AuthService } from "@/services/AuthService";
import { toast } from "react-hot-toast"; // Khuyên dùng toast để thông báo đẹp hơn

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
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- SỬA 2: Xử lý Đăng Ký đúng luồng ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!"); // Hoặc dùng toast.error
      return;
    }

    setIsLoading(true);
    try {
        // Gọi API REGISTER (Gửi Name + Email + Pass)
        await AuthService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        // Thành công -> Chuyển sang bước OTP
        setStep('otp'); 
        setTimer(60);
    } catch (error: any) {
        // Backend trả lỗi (ví dụ: Email đã tồn tại)
        const msg = error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
        alert(msg);
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
      await AuthService.sendOtp(formData.email);
      setTimer(60);
      alert("Đã gửi lại mã OTP!");
    } catch (error) {
      alert("Không thể gửi lại mã.");
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

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {/* --- Bind dữ liệu vào Form --- */}
              <AuthInput 
                label="Họ và tên" 
                placeholder="Nhập họ và tên" 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <AuthInput 
                label="Email" 
                placeholder="Nhập email của bạn" 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <AuthInput 
                label="Mật khẩu" 
                placeholder="Nhập mật khẩu" 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <AuthInput 
                label="Nhập lại mật khẩu" 
                placeholder="Xác nhận mật khẩu" 
                type="password" 
                required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 my-2">
                <input 
                  id="terms" 
                  type="checkbox" 
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange cursor-pointer accent-orange-500" 
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed select-none">
                  Bằng việc đăng ký, bạn đồng ý với LoveGifts về{" "}
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
              <SocialButton iconSrc="/assets/SvgAsset2.svg" label="Google" />
              <SocialButton iconSrc="/assets/SvgAsset1.svg" label="Facebook" />
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