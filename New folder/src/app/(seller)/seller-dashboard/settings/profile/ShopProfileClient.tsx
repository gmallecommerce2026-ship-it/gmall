"use client";
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { SellerAuthService } from "@/services/SellerAuthService";
import { useUserStore } from "@/store/useUserStore";
import { PrimaryButton } from "@/components/auth/AuthComponents";

// --- 1. Zod Schema ---
const shopProfileSchema = z.object({
  shopName: z.string()
    .min(3, "Tên Shop tối thiểu 3 ký tự")
    .max(30, "Tên Shop tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ_]+$/, "Tên không chứa ký tự đặc biệt"),
  pickupAddress: z.string().min(10, "Địa chỉ cần chi tiết hơn (tối thiểu 10 ký tự)"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
});

type ShopProfileForm = z.infer<typeof shopProfileSchema>;

export default function ShopProfileClient() {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs để trigger click input file
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShopProfileForm>({
    resolver: zodResolver(shopProfileSchema),
    defaultValues: {
      shopName: "",
      pickupAddress: "",
      description: ""
    }
  });

  // --- LOGIC FILL DATA ---
  useEffect(() => {
    if (user) {
        reset({
            shopName: user.shopName || user.name || "",
            pickupAddress: user.pickupAddress || "",
            description: user.description || "",
        });
        setAvatarPreview(user.avatar || "/assets/default-avatar.svg"); 
        setCoverPreview(user.coverImage || null);
    }
}, [user, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh tối đa 2MB");
        return;
    }

    const url = URL.createObjectURL(file);
    if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(url);
    } else {
        setCoverFile(file);
        setCoverPreview(url);
    }
  };

  const triggerAvatarUpload = () => avatarInputRef.current?.click();
  const triggerCoverUpload = () => coverInputRef.current?.click();

  const onSubmit = async (data: ShopProfileForm) => {
    setIsLoading(true);
    try {
        const formData = new FormData();
        formData.append("shopName", data.shopName);
        formData.append("pickupAddress", data.pickupAddress);
        if (data.description) {
            formData.append("description", data.description);
        }
        
        if (avatarFile) formData.append("avatar", avatarFile);
        if (coverFile) formData.append("cover", coverFile);

        const res = await SellerAuthService.updateShopProfile(formData);
        
        if (res?.user) {
            setUser(res.user);
            toast.success("Đã lưu hồ sơ Shop!");
        }
    } catch (error: any) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Shop</h1>
        <p className="text-gray-500 text-sm">Quản lý thông tin hiển thị với khách hàng</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
            
            {/* Cột 1: Thông tin Text */}
            <div className="p-6 lg:col-span-2 space-y-6 order-2 lg:order-1">
                <div className="grid gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tên Shop <span className="text-red-500">*</span></label>
                        <input 
                            {...register("shopName")}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                            placeholder="Nhập tên shop..."
                        />
                        {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Mô tả Shop</label>
                        <textarea 
                            {...register("description")}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                            placeholder="Giới thiệu đôi nét về shop của bạn..."
                        />
                         {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Địa chỉ kho hàng <span className="text-red-500">*</span></label>
                        <input 
                            {...register("pickupAddress")}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none"
                            placeholder="Địa chỉ để shipper đến lấy hàng..."
                        />
                        {errors.pickupAddress && <p className="text-red-500 text-xs mt-1">{errors.pickupAddress.message}</p>}
                    </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                    <div className="w-full md:w-auto md:min-w-[150px]">
                        <PrimaryButton disabled={isLoading}>
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            {/* Cột 2: Hình ảnh */}
            <div className="p-6 bg-gray-50/50 flex flex-col items-center gap-6 order-1 lg:order-2">
                
                {/* Avatar Uploader */}
                <div className="text-center w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Avatar Shop</label>
                    
                    <div 
                        onClick={triggerAvatarUpload}
                        className="relative group mx-auto w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 cursor-pointer hover:border-brand-orange/50 transition-colors"
                    >
                        <img 
                            src={avatarPreview || "/assets/default-avatar.svg"} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                        />
                        
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-xs">
                            <span className="font-medium">Thay đổi</span>
                        </div>
                        <input 
                            ref={avatarInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageChange(e, 'avatar')} 
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Dung lượng tối đa 2MB</p>
                </div>

                <div className="w-full border-t border-gray-200 my-2"></div>

                {/* Cover Uploader */}
                <div className="text-center w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh bìa (Cover)</label>
                    
                    <div 
                        onClick={triggerCoverUpload}
                        className="relative group w-full h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-100 cursor-pointer hover:border-brand-orange transition-colors"
                    >
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Chưa có ảnh bìa</div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-sm font-medium">
                            Tải ảnh bìa
                        </div>
                        <input 
                            ref={coverInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageChange(e, 'cover')} 
                        />
                    </div>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}