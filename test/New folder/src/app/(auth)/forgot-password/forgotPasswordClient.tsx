"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout, AuthInput, PrimaryButton } from "@/components/auth/AuthComponents";

// Icon mũi tên quay lại
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

// Icon gửi thư thành công (Minh họa)
const MailSentIcon = () => (
  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce-slow">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-brand-orange">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  </div>
);

const ForgotPasswordClient = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Giả lập gọi API gửi mail (Delay 1.5s để tạo cảm giác xử lý)
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      // Ở thực tế, bạn sẽ gọi API: await authService.forgotPassword(email);
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[500px] transition-all duration-500 ease-in-out">
        
        {/* --- STATE 1: FORM NHẬP EMAIL --- */}
        {!isSubmitted ? (
          <div className="flex flex-col gap-6 fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-brand-orange mb-3">
                Quên mật khẩu?
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                Đừng lo lắng, chuyện này vẫn thường xảy ra. Hãy nhập email của bạn xuống phía dưới, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <AuthInput
                label="Email đăng ký"
                placeholder="Ví dụ: nguyenvan@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="placeholder:text-gray-400"
              />

              <PrimaryButton>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi hướng dẫn"
                )}
              </PrimaryButton>
            </form>
          </div>
        ) : (
          
          /* --- STATE 2: SUCCESS FEEDBACK (Hiện ra sau khi gửi) --- */
          <div className="flex flex-col gap-6 text-center fade-in">
            <MailSentIcon />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Kiểm tra email của bạn
              </h2>
              <p className="text-gray-500 text-base mb-6">
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến: <br />
                <span className="font-semibold text-brand-orange">{email}</span>
              </p>
              <p className="text-sm text-gray-400">
                Không nhận được email? Kiểm tra thư mục Spam hoặc{" "}
                <button 
                  onClick={() => setIsSubmitted(false)} 
                  className="text-brand-blue font-medium hover:underline"
                >
                  thử lại địa chỉ khác
                </button>
              </p>
            </div>
            
            <Link href="https://mail.google.com" target="_blank" className="w-full">
               <button className="w-full h-[50px] border border-gray-200 rounded-full font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                 Mở Gmail ngay
               </button>
            </Link>
          </div>
        )}

        {/* --- FOOTER: BACK TO LOGIN --- */}
        <div className="mt-8 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-orange transition-colors"
          >
            <ArrowLeftIcon />
            Quay lại đăng nhập
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordClient;