// src/app/seller/register/page.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AuthInput, PrimaryButton } from "@/components/auth/AuthComponents";
import { OtpInput } from "@/components/auth/OtpInput";
import { AuthService } from "@/services/AuthService";
import { SellerAuthService } from "@/services/SellerAuthService";
import { toast } from "react-hot-toast";

// Định nghĩa lại thứ tự các bước
type Step = 'account' | 'shop_info' | 'legal_info' | 'otp' | 'success';

const SellerRegisterPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [isLoading, setIsLoading] = useState(false);

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otpCode: '',
    shopName: '',
    phoneNumber: '',
    pickupAddress: '', 
    businessType: 'personal',
    taxCode: '',
    licenseImage: null as File | null, 
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, licenseImage: e.target.files![0] }));
    }
  };

  // --- BƯỚC 1: XÁC NHẬN THÔNG TIN TÀI KHOẢN (Chuyển sang Shop Info) ---
  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    // Không gửi OTP ở đây nữa, chỉ chuyển bước
    setCurrentStep('shop_info');
  };

  // --- BƯỚC 2: SHOP INFO (Chuyển sang Legal) ---
  const handleShopNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('legal_info');
  };

  // --- BƯỚC 3: LEGAL & SUBMIT (Gọi API Register -> Chuyển sang OTP) ---
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.licenseImage) {
      toast.error("Vui lòng tải lên ảnh Giấy phép KD hoặc CCCD.");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('name', formData.shopName); // Backend đang map name hoặc shopName
      submitData.append('shopName', formData.shopName);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('pickupAddress', formData.pickupAddress);
      submitData.append('taxCode', formData.taxCode);
      submitData.append('licenseDocument', formData.licenseImage);

      // Gọi API Register (Backend sẽ tạo user & gửi OTP)
      await SellerAuthService.registerSeller(submitData);
      
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email lấy mã OTP.");
      setCurrentStep('otp'); // Chuyển sang bước nhập OTP
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- BƯỚC 4: XÁC THỰC OTP (Gọi API Verify -> Chuyển sang Success) ---
  const handleVerifyOtp = async () => {
    if (formData.otpCode.length < 6) {
        toast.error("Vui lòng nhập đủ 6 số OTP");
        return;
    }
    setIsLoading(true);
    try {
      // Gọi API Verify OTP
      await AuthService.verifyOtp(formData.email, formData.otpCode);
      
      // Nếu không lỗi -> Thành công
      setCurrentStep('success');
    } catch (error) {
      toast.error("Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại OTP ở bước 4 nếu cần
  const handleResendOtp = async () => {
      try {
          await AuthService.sendOtp(formData.email);
          toast.success("Đã gửi lại mã OTP.");
      } catch (error) {
          toast.error("Không thể gửi lại mã.");
      }
  }

  return (
    <div className="w-full max-w-[600px] bg-white rounded-xl shadow-lg p-8 border border-gray-100 mx-auto my-10">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8 border-b border-gray-100 pb-4">
         {['Tài khoản', 'Thông tin Shop', 'Định danh', 'Xác thực', 'Hoàn tất'].map((label, idx) => {
            const steps: Step[] = ['account', 'shop_info', 'legal_info', 'otp', 'success'];
            const currentIdx = steps.indexOf(currentStep);
            const isActive = idx <= currentIdx;
            
            return (
                <div key={idx} className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-brand-orange' : 'text-gray-300'}`}>
                   <span className="hidden sm:inline">{idx + 1}. </span>{label}
                </div>
            )
         })}
      </div>

      <div>
        {/* --- STEP 1: ACCOUNT --- */}
        {currentStep === 'account' && (
          <form onSubmit={handleAccountNext} className="flex flex-col gap-5 animate-fade-in">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Đăng ký người bán</h2>
                <p className="text-gray-500 text-sm">Bước 1: Thiết lập tài khoản đăng nhập</p>
            </div>
            
            <AuthInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required placeholder="Email đăng nhập" />
            <AuthInput label="Số điện thoại" type="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required placeholder="SĐT liên hệ" />
            
            <div className="grid grid-cols-2 gap-4">
                <AuthInput label="Mật khẩu" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
                <AuthInput label="Nhập lại MK" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required />
            </div>
            
            <PrimaryButton>Tiếp theo</PrimaryButton>
            <div className="text-center mt-2 text-sm">
                Bạn đã có tài khoản? <Link href="/seller/login" className="text-brand-orange font-medium hover:underline">Đăng nhập ngay</Link>
            </div>
          </form>
        )}

        {/* --- STEP 2: SHOP INFO --- */}
        {currentStep === 'shop_info' && (
          <form onSubmit={handleShopNext} className="flex flex-col gap-5 animate-fade-in">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Thông tin Cửa hàng</h2>
                <p className="text-gray-500 text-sm">Bước 2: Thiết lập thông tin hiển thị</p>
            </div>

            <AuthInput label="Tên Shop" value={formData.shopName} onChange={(e) => handleInputChange('shopName', e.target.value)} required placeholder="VD: LoveGifts Official" />
            
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Địa chỉ lấy hàng</label>
                <textarea 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all resize-none text-sm"
                    rows={3} required placeholder="Địa chỉ kho để Shipper đến lấy hàng..."
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                />
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={() => setCurrentStep('account')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Quay lại</button>
                <div className="flex-1"><PrimaryButton>Tiếp theo</PrimaryButton></div>
            </div>
          </form>
        )}

        {/* --- STEP 3: LEGAL INFO (SUBMIT) --- */}
        {currentStep === 'legal_info' && (
          <form onSubmit={handleSubmitApplication} className="flex flex-col gap-5 animate-fade-in">
             <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Định danh pháp lý</h2>
                <p className="text-gray-500 text-sm">Bước 3: Tải lên giấy tờ để xét duyệt</p>
            </div>
            
            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md cursor-pointer transition-all ${formData.businessType === 'personal' ? 'bg-white shadow-sm text-brand-orange font-medium' : 'text-gray-500'}`}>
                    <input type="radio" name="bizType" checked={formData.businessType === 'personal'} onChange={() => handleInputChange('businessType', 'personal')} className="hidden"/>
                    <span>Cá nhân</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md cursor-pointer transition-all ${formData.businessType === 'company' ? 'bg-white shadow-sm text-brand-orange font-medium' : 'text-gray-500'}`}>
                    <input type="radio" name="bizType" checked={formData.businessType === 'company'} onChange={() => handleInputChange('businessType', 'company')} className="hidden"/>
                    <span>Công ty / HKD</span>
                </label>
            </div>

            <AuthInput label="Mã số thuế / CCCD" value={formData.taxCode} onChange={(e) => handleInputChange('taxCode', e.target.value)} required placeholder="Nhập số giấy tờ tùy thân/MST" />
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Ảnh chụp Giấy tờ (Mặt trước)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {formData.licenseImage ? (
                        <div className="text-green-600 font-medium flex items-center gap-2 px-4">
                            <span className="truncate max-w-[200px]">{formData.licenseImage.name}</span>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Đã chọn</span>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">
                            <span className="text-brand-orange font-medium">Tải ảnh lên</span><br/>(JPG, PNG, PDF)
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setCurrentStep('shop_info')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Quay lại</button>
                <div className="flex-1">
                    <PrimaryButton disabled={isLoading}>
                        {isLoading ? "Đang gửi hồ sơ..." : "Gửi hồ sơ & Xác thực"}
                    </PrimaryButton>
                </div>
            </div>
          </form>
        )}

        {/* --- STEP 4: OTP (MỚI) --- */}
        {currentStep === 'otp' && (
          <div className="flex flex-col gap-6 text-center animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Xác thực Email</h2>
                <p className="text-gray-500 mt-2">
                    Mã xác thực đã được gửi tới <b>{formData.email}</b>.<br/>
                    Vui lòng nhập mã để hoàn tất đăng ký.
                </p>
            </div>
            
            <div className="flex justify-center py-4">
                <OtpInput length={6} onComplete={(val) => handleInputChange('otpCode', val)} />
            </div>

            <PrimaryButton onClick={handleVerifyOtp} disabled={isLoading}>
                {isLoading ? "Đang kiểm tra..." : "Xác thực ngay"}
            </PrimaryButton>
            
            <button onClick={handleResendOtp} className="text-sm text-brand-orange hover:underline font-medium">
                Gửi lại mã OTP
            </button>
          </div>
        )}

        {/* --- STEP 5: SUCCESS --- */}
        {currentStep === 'success' && (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Đăng ký thành công!</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed max-w-md mx-auto">
                Tài khoản của bạn đã được xác thực Email. <br/>
                Hồ sơ đang ở trạng thái <b>Chờ Admin phê duyệt</b> (trong vòng 24h).<br/>
                Bạn sẽ nhận được email thông báo khi có kết quả.
            </p>
            <div className="flex gap-3 justify-center">
                <Link href="/" className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Về trang chủ</Link>
                {/* Nút đăng nhập vẫn hoạt động nhưng login vào sẽ bị lỗi quyền PENDING nếu backend chưa sửa, nhưng logic UI là đúng */}
                <Link href="/seller/login" className="px-5 py-2.5 bg-brand-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">Đăng nhập Seller</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRegisterPage;