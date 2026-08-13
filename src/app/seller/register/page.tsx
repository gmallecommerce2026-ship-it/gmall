// src/app/seller/register/page.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AuthInput, PrimaryButton } from "@/components/auth/AuthComponents";
import { OtpInput } from "@/components/auth/OtpInput";
import { AuthService } from "@/services/AuthService";
import { SellerAuthService } from "@/services/SellerAuthService";
import { toast } from "react-hot-toast";
import { AddressSelector } from "@/components/common/AddressSelector"; 
import { uploadFileToR2 } from "@/services/uploadService";
import CategorySelector from "@/components/seller/CategorySelector";
type Step = 'account' | 'shop_info'| 'category' | 'legal_info' | 'otp' | 'success';

const SellerRegisterPage = () => {
  const [isAgreed, setIsAgreed] = useState(false);
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
    businessType: 'personal',
    taxCode: '',
    // [SỬA] Thay licenseImage đơn lẻ thành 2 ảnh trước/sau
    frontImage: null as File | null, 
    backImage: null as File | null,
    categoryId: '',
  });

  const [addressData, setAddressData] = useState<any>({});

  const validateFile = (file: File) => {
    // 1. Check định dạng
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)");
        return false;
    }
    
    // 2. Check dung lượng (ví dụ max 5MB)
    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
        toast.error("Dung lượng ảnh tối đa 5MB");
        return false;
    }
    return true;
 };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // [SỬA] Hàm xử lý file mới để nhận biết đang up mặt trước hay sau
  const handleFileChange = (field: 'frontImage' | 'backImage', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
          setFormData(prev => ({ ...prev, [field]: file }));
      } else {
          // Reset input nếu file lỗi
          e.target.value = ''; 
      }
    }
  };

  // --- BƯỚC 1: XÁC NHẬN THÔNG TIN TÀI KHOẢN ---
  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setCurrentStep('shop_info');
  };

  // --- BƯỚC 2: SHOP INFO ---
  const handleShopNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressData.provinceId || !addressData.districtId) {
        toast.error("Vui lòng chọn đầy đủ địa chỉ kho hàng.");
        return;
    }
    // Chuyển sang bước chọn danh mục thay vì legal_info
    setCurrentStep('category'); 
  };

  const handleCategoryNext = () => {
    if (!formData.categoryId) {
        toast.error("Vui lòng chọn một ngành hàng chủ lực.");
        return;
    }
    setCurrentStep('legal_info');
  };

  // --- BƯỚC 3: LEGAL & SUBMIT ---
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.frontImage || !formData.backImage) {
      toast.error("Vui lòng tải lên đủ ảnh mặt trước và mặt sau.");
      return;
    }

    if(!addressData?.provinceId || !addressData?.districtId || !addressData?.wardCode) {
         toast.error("Thông tin địa chỉ bị lỗi. Vui lòng chọn lại.");
         return;
    }

    setIsLoading(true);
    try {
      // 1. Upload ảnh lên R2 lấy URL (giữ nguyên logic này)
      const [frontUrl, backUrl] = await Promise.all([
         uploadFileToR2(formData.frontImage),
         uploadFileToR2(formData.backImage)
      ]);

      // 2. [SỬA QUAN TRỌNG] Tạo Object JSON thay vì FormData
      const submitData = {
          email: formData.email,
          password: formData.password,
          name: formData.shopName, // Tên người đại diện
          categoryId: formData.categoryId,
          phoneNumber: formData.phoneNumber,
          shopName: formData.shopName,
          taxCode: formData.taxCode,
          
          // Gửi URL ảnh (String)
          businessLicenseFront: frontUrl,
          businessLicenseBack: backUrl,
          
          // Địa chỉ (Ép kiểu về Number nếu Backend yêu cầu số)
          pickupAddress: addressData.fullAddress || '',
          provinceId: Number(addressData.provinceId), 
          districtId: Number(addressData.districtId),
          wardCode: addressData.wardCode,
          lat: Number(addressData.lat || 0),
          lng: Number(addressData.lng || 0),
      };

      // Gửi JSON
      await SellerAuthService.registerSeller(submitData);
      
      toast.success("Hồ sơ đã được gửi! Vui lòng nhập OTP để kích hoạt.");
      setCurrentStep('otp');
    } catch (error: any) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Đăng ký thất bại.";
      // Nếu msg là mảng lỗi (như bạn gặp), nối chuỗi lại cho dễ đọc
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- BƯỚC 4: XÁC THỰC OTP ---
  const handleVerifyOtp = async () => {
    if (formData.otpCode.length < 6) {
        toast.error("Vui lòng nhập đủ 6 số OTP");
        return;
    }
    setIsLoading(true);
    try {
      await AuthService.verifyOtp(formData.email, formData.otpCode);
      setCurrentStep('success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Xác thực thất bại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
      try {
          await AuthService.sendOtp(formData.email);
          toast.success("Đã gửi lại mã OTP.");
      } catch (error) {
          toast.error("Không thể gửi lại mã.");
      }
  }
  const isPasswordMatch = formData.password === formData.confirmPassword || formData.confirmPassword === '';

  return (
    <div className="w-full max-w-[800px] bg-white rounded-xl shadow-lg p-8 border border-gray-100 mx-auto my-10 transition-all duration-300">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8 border-b border-gray-100 pb-4 overflow-x-auto">
         {['Tài khoản', 'Thông tin Shop', 'Ngành hàng', 'Định danh', 'Xác thực', 'Hoàn tất'].map((label, idx) => {
            const steps: Step[] = ['account', 'shop_info', 'category', 'legal_info', 'otp', 'success'];
            const currentIdx = steps.indexOf(currentStep);
            const isActive = idx <= currentIdx;
            
            return (
                <div key={idx} className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap px-2 ${isActive ? 'text-brand-orange' : 'text-gray-300'}`}>
                   <span className="hidden sm:inline">{idx + 1}. </span>{label}
                </div>
            )
         })}
      </div>

      <div>
        {/* --- STEP 1: ACCOUNT --- */}
        {currentStep === 'account' && (
          <form onSubmit={handleAccountNext} className="flex flex-col gap-5 animate-fade-in max-w-[600px] mx-auto">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Đăng ký người bán</h2>
                <p className="text-gray-500 text-sm">Bước 1: Thiết lập tài khoản đăng nhập</p>
            </div>
            
            <AuthInput label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required placeholder="Email đăng nhập" />
            <AuthInput label="Số điện thoại" type="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required placeholder="SĐT liên hệ" />
            
            <div className="grid grid-cols-2 gap-4">
                <AuthInput label="Mật khẩu" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className={!isPasswordMatch ? "border-red-500" : ""}/>
                <AuthInput label="Nhập lại mật khẩu" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className={!isPasswordMatch ? "border-red-500" : ""}/>
                {!isPasswordMatch && <span className="text-xs text-red-500">Mật khẩu không khớp</span>}
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
                <p className="text-gray-500 text-sm">Bước 2: Thiết lập thông tin hiển thị và kho hàng</p>
            </div>

            <div className="max-w-[600px] mx-auto w-full space-y-5">
                <AuthInput label="Tên Shop" value={formData.shopName} onChange={(e) => handleInputChange('shopName', e.target.value)} required placeholder="VD: GMall Official" />
                
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Địa chỉ kho hàng (Quan trọng)</label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <AddressSelector 
                            value={addressData}
                            onChange={setAddressData}
                        />
                    </div>
                    <p className="text-xs text-gray-500">Shipper sẽ đến địa chỉ này để lấy hàng. Vui lòng chọn chính xác trên bản đồ.</p>
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => setCurrentStep('account')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Quay lại</button>
                    <div className="flex-1"><PrimaryButton>Tiếp theo</PrimaryButton></div>
                </div>
            </div>
          </form>
        )}

        {currentStep === 'category' && (
          <div className="flex flex-col gap-5 animate-fade-in max-w-[600px] mx-auto">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Ngành hàng kinh doanh</h2>
                <p className="text-gray-500 text-sm">Bước 3: Chọn ngành hàng chủ lực của Shop bạn</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 min-h-[300px] bg-white">
                 <CategorySelector 
                    selectedIds={formData.categoryId ? [formData.categoryId] : []}
                    singleSelect={true} // Chỉ cho chọn 1 ngành hàng chính
                    onChange={(ids) => {
                        // ids là mảng string[], lấy phần tử đầu tiên
                        const selectedId = ids.length > 0 ? ids[0] : '';
                        handleInputChange('categoryId', selectedId);
                    }}
                 />
            </div>

            <div className="flex gap-3 mt-4">
                <button 
                    type="button" 
                    onClick={() => setCurrentStep('shop_info')} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                    Quay lại
                </button>
                <div className="flex-1">
                    <PrimaryButton onClick={handleCategoryNext}>
                        Tiếp theo
                    </PrimaryButton>
                </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: LEGAL INFO (ĐÃ SỬA UI ĐỂ UPLOAD 2 ẢNH) --- */}
        {currentStep === 'legal_info' && (
          <form onSubmit={handleSubmitApplication} className="flex flex-col gap-5 animate-fade-in max-w-[600px] mx-auto">
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
            
            {/* [SỬA] Khu vực upload 2 ảnh */}
            <div className="grid grid-cols-2 gap-4">
                {/* MẶT TRƯỚC */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        {formData.businessType === 'personal' ? 'CCCD Mặt trước' : 'GPKD Mặt trước'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50 overflow-hidden">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange('frontImage', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {formData.frontImage ? (
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-green-600 font-bold text-xs truncate w-24">{formData.frontImage.name}</span>
                                <span className="text-green-500 text-[10px]">Đã chọn</span>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-xs">
                                <span className="text-brand-orange font-medium">Tải ảnh lên</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MẶT SAU */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        {formData.businessType === 'personal' ? 'CCCD Mặt sau' : 'GPKD Mặt sau'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50 overflow-hidden">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange('backImage', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {formData.backImage ? (
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-green-600 font-bold text-xs truncate w-24">{formData.backImage.name}</span>
                                <span className="text-green-500 text-[10px]">Đã chọn</span>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-xs">
                                <span className="text-brand-orange font-medium">Tải ảnh lên</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2 py-2">
                <input 
                    type="checkbox" 
                    id="agree-term"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-brand-orange rounded border-gray-300 focus:ring-brand-orange"
                />
                <label htmlFor="agree-term" className="text-sm text-gray-600">
                    Tôi cam kết thông tin trên là chính xác và đồng ý với <Link href="/terms" target="_blank" className="text-brand-orange hover:underline">Điều khoản dịch vụ</Link> & <Link href="/privacy" target="_blank" className="text-brand-orange hover:underline">Chính sách bảo mật</Link> của sàn.
                </label>
            </div>

            <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setCurrentStep('category')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Quay lại</button>
                <div className="flex-1">
                    <PrimaryButton disabled={isLoading}>
                        {isLoading ? "Đang gửi hồ sơ..." : "Gửi hồ sơ & Xác thực"}
                    </PrimaryButton>
                </div>
            </div>
          </form>
        )}


        {/* --- STEP 4 & 5 (GIỮ NGUYÊN) --- */}
        {currentStep === 'otp' && (
          <div className="flex flex-col gap-6 text-center animate-fade-in max-w-[600px] mx-auto">
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

        {currentStep === 'success' && (
          <div className="text-center py-6 animate-fade-in max-w-[600px] mx-auto">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Đã gửi yêu cầu mở Shop!</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-md mx-auto">
                Tài khoản của bạn đã được kích hoạt thành công.<br/>
                Tuy nhiên, Cửa hàng <b>{formData.shopName}</b> đang ở trạng thái 
                <span className="text-yellow-600 font-bold"> Chờ duyệt (Pending)</span>.<br/>
                Admin sẽ xem xét hồ sơ trong 24h. Bạn vẫn có thể đăng nhập với tư cách Người mua ngay bây giờ.
            </p>
            <div className="flex gap-3 justify-center">
                <Link href="/" className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Về trang chủ
                </Link>
                <Link href="/seller/login" className="px-5 py-2.5 bg-brand-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
                    Đăng nhập ngay
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRegisterPage;