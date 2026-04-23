"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, AuthInput, PrimaryButton } from "@/components/auth/AuthComponents";
import { AuthService } from "@/services/AuthService";

// Icon Mắt (Eye) - Tái sử dụng
const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  isVisible ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-orange">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-gray-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
);

// Icon Success (Hoàn thành)
const CheckShieldIcon = () => (
  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 mx-auto animate-scale-in">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-500">
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 12c0 5.542 4.207 10.227 9.686 10.915a.75.75 0 00.128 0c5.48-.688 9.686-5.373 9.686-10.915a12.74 12.74 0 00-.635-6.235.75.75 0 00-.722-.515 11.208 11.208 0 01-7.877-3.08zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" /> {/* Shield Base */}
      <path d="M15.75 9.75a.75.75 0 00-1.06-1.06L11.25 12.19l-1.69-1.69a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.94-4.94z" /> {/* Checkmark inside */}
    </svg>
  </div>
);

const ResetPasswordClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Email + token nhận từ URL query (link trong email reset password).
  // User cũng có thể tự nhập nếu link không hoạt động (paste OTP từ email).
  const emailFromUrl = searchParams.get("email") ?? "";
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Quản lý ẩn/hiện mật khẩu riêng biệt cho 2 ô
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Tự động xóa lỗi khi người dùng nhập lại
  useEffect(() => {
    if (error) setError("");
  }, [email, token, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate cơ bản
    if (!email) {
      setError("Thiếu email. Hãy mở lại link từ email đặt lại mật khẩu.");
      return;
    }
    if (!token) {
      setError("Thiếu mã xác nhận. Hãy dán mã từ email của bạn.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.resetPassword({
        email,
        token,
        newPassword: password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[500px] transition-all duration-500">
        
        {!isSuccess ? (
          <div className="flex flex-col gap-6 fade-in">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-brand-orange mb-3">
                Đặt lại mật khẩu
              </h1>
              <p className="text-gray-500 text-base">
                Tạo mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Email — prefill từ URL nhưng cho phép sửa nếu link không rõ */}
              <AuthInput
                label="Email tài khoản"
                placeholder="email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* OTP — prefill từ URL. User cũng có thể gõ tay 6 số từ email. */}
              <AuthInput
                label="Mã xác nhận (6 số)"
                placeholder="123456"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />

              {/* Password Field */}
              <div onClick={() => setShowPass(!showPass)}>
                <AuthInput
                  label="Mật khẩu mới"
                  placeholder="Ít nhất 6 ký tự"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<EyeIcon isVisible={showPass} />}
                  className={error && password.length > 0 && password.length < 6 ? "border-red-500 focus:border-red-500" : ""}
                />
              </div>

              {/* Confirm Password Field */}
              <div onClick={() => setShowConfirmPass(!showConfirmPass)}>
                <AuthInput
                  label="Nhập lại mật khẩu"
                  placeholder="Nhập lại mật khẩu mới"
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<EyeIcon isVisible={showConfirmPass} />}
                  className={error && password !== confirmPassword ? "border-red-500 focus:border-red-500" : ""}
                />
              </div>

              {/* Error Message Area */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm py-2 px-3 rounded-lg flex items-center gap-2 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-2">
                <PrimaryButton>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang cập nhật...
                    </span>
                  ) : (
                    "Xác nhận thay đổi"
                  )}
                </PrimaryButton>
              </div>
            </form>
          </div>
        ) : (
          
          /* --- SUCCESS STATE --- */
          <div className="flex flex-col gap-6 text-center fade-in py-8">
            <CheckShieldIcon />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Đổi mật khẩu thành công!
              </h2>
              <p className="text-gray-500 text-base">
                Tài khoản của bạn đã được bảo mật. <br/>
                Hãy sử dụng mật khẩu mới để đăng nhập.
              </p>
            </div>
            
            <div className="mt-4 w-full">
              <Link href="/login">
                <button className="w-full h-[50px] bg-brand-orange text-white rounded-full font-medium text-base shadow-lg hover:opacity-90 transition-all">
                  Đăng nhập ngay
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Footer Link - Chỉ hiện khi chưa thành công */}
        {!isSuccess && (
          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-brand-orange transition-colors">
              Quay lại đăng nhập
            </Link>
          </div>
        )}

      </div>
    </AuthLayout>
  );
};

export default ResetPasswordClient;