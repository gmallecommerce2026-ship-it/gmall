"use client";
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { SellerAuthService, UpdateShopProfilePayload } from "@/services/SellerAuthService";
import { useUserStore } from "@/store/useUserStore";
import { PrimaryButton } from "@/components/auth/AuthComponents";
// Đảm bảo bạn đã cài react-icons: npm install react-icons
import { FiUploadCloud, FiFileText } from "react-icons/fi";
import { uploadFileToR2 } from "@/services/uploadService";
import { ShopService } from "@/services/shop.service";

// --- 1. Zod Schema ---
const shopProfileSchema = z.object({
  shopName: z.string()
    .min(3, "Tên Shop tối thiểu 3 ký tự")
    .max(30, "Tên Shop tối đa 30 ký tự")
    // CẬP NHẬT REGEX TẠI ĐÂY:
    // Thêm \- (gạch ngang)
    // Thêm dãy ký tự Tiếng Việt in hoa (ÀÁ...) để hỗ trợ tốt hơn
    .regex(
      /^[a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ_\-]+$/, 
      "Tên chỉ được chứa chữ cái, số, khoảng trắng, gạch ngang (-) và gạch dưới (_)"
    ),
  pickupAddress: z.string().min(10, "Địa chỉ cần chi tiết hơn (tối thiểu 10 ký tự)"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
});

type ShopProfileForm = z.infer<typeof shopProfileSchema>;
type LegalDocType = 'businessLicenseFront' | 'businessLicenseBack' | 'salesLicense' | 'trademarkCert' | 'distributorCert';

export default function ShopProfileClient() {
  const { user, setUser } = useUserStore();
  const [shopData, setShopData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // State ảnh
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // State giấy tờ (Khởi tạo đầy đủ để tránh lỗi undefined)
  const [legalDocs, setLegalDocs] = useState<{ [key in LegalDocType]: { file: File | null, preview: string | null, status?: string} }>({
    businessLicenseFront: { file: null, preview: null },
    businessLicenseBack: { file: null, preview: null },
    salesLicense: { file: null, preview: null },
    trademarkCert: { file: null, preview: null },
    distributorCert: { file: null, preview: null },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShopProfileForm>({
    resolver: zodResolver(shopProfileSchema),
    defaultValues: { shopName: "", pickupAddress: "", description: "" }
  });

  // --- LOGIC FILL DATA ---
  useEffect(() => {
    const fetchMyShop = async () => {
        try {
            // Gọi API: GET /shops/me (đã có trong ShopController)
            const res = await ShopService.getMyShop(); 
            setShopData(res);
            
            // Fill form
            reset({
                shopName: res.name || "",
                pickupAddress: res.pickupAddress || "",
                description: res.description || "",
            });
            
            setAvatarPreview(res.avatar || "/assets/default-avatar.svg");
            setCoverPreview(res.coverImage || null);

            // Xử lý hiển thị giấy tờ (Ưu tiên hiển thị cái đang Pending nếu có)
            const pending = res.pendingDetails || {};
            
            const getDocValue = (key: string) => {
                // Nếu có trong pending -> Hiển thị kèm trạng thái chờ
                if (pending[key]) return { val: pending[key], status: 'pending' };
                // Nếu không -> Hiển thị cái hiện tại
                return { val: res[key], status: 'approved' };
            };

            setLegalDocs(prev => ({
                businessLicenseFront: { ...prev.businessLicenseFront, preview: getDocValue('businessLicenseFront').val, status: getDocValue('businessLicenseFront').status },
                businessLicenseBack: { ...prev.businessLicenseBack, preview: getDocValue('businessLicenseBack').val, status: getDocValue('businessLicenseBack').status },
                // ... làm tương tự cho các docs khác
                salesLicense: { ...prev.salesLicense, preview: getDocValue('salesLicense').val, status: getDocValue('salesLicense').status },
                trademarkCert: { ...prev.trademarkCert, preview: getDocValue('trademarkCert').val, status: getDocValue('trademarkCert').status },
                distributorCert: { ...prev.distributorCert, preview: getDocValue('distributorCert').val, status: getDocValue('distributorCert').status },
            }));

        } catch (error) {
            console.error("Lỗi tải thông tin shop:", error);
            toast.error("Không tải được thông tin Shop");
        }
    };

    fetchMyShop();
  }, [reset]);

  // Handle ảnh Avatar/Cover
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ảnh tối đa 2MB"); return; }

    const url = URL.createObjectURL(file);
    if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url); }
    else { setCoverFile(file); setCoverPreview(url); }
  };

  // Handle ảnh Giấy tờ
  const handleLegalDocChange = (e: React.ChangeEvent<HTMLInputElement>, type: LegalDocType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Tài liệu tối đa 5MB"); return; }

    const url = URL.createObjectURL(file);
    setLegalDocs(prev => ({
        ...prev,
        [type]: { file: file, preview: url }
    }));
  };

  // Upload helper
  const processImageUpload = async (newFile: File | null, currentUrl: string | null): Promise<string | undefined> => {
    if (newFile) {
        return await uploadFileToR2(newFile);
    }
    if (currentUrl && !currentUrl.startsWith('blob:')) {
        return currentUrl;
    }
    return undefined; 
  };

  const onSubmit = async (data: ShopProfileForm) => {
    setIsLoading(true);
    try {
        setIsUploading(true);
        const u = user as any; // Safe cast

        const [
            avatarUrl, coverUrl,
            businessLicenseFrontUrl, businessLicenseBackUrl,
            salesLicenseUrl, trademarkCertUrl, distributorCertUrl
        ] = await Promise.all([
            processImageUpload(avatarFile, user?.avatar || null),
            processImageUpload(coverFile, user?.coverImage || null),
            processImageUpload(legalDocs.businessLicenseFront.file, u?.businessLicenseFront || null),
            processImageUpload(legalDocs.businessLicenseBack.file, u?.businessLicenseBack || null),
            processImageUpload(legalDocs.salesLicense.file, u?.salesLicense || null),
            processImageUpload(legalDocs.trademarkCert.file, u?.trademarkCert || null),
            processImageUpload(legalDocs.distributorCert.file, u?.distributorCert || null),
        ]);

        setIsUploading(false);

        const payload: UpdateShopProfilePayload = {
            shopName: data.shopName,
            pickupAddress: data.pickupAddress,
            description: data.description,
            avatar: avatarUrl,
            cover: coverUrl,
            businessLicenseFront: businessLicenseFrontUrl,
            businessLicenseBack: businessLicenseBackUrl,
            salesLicense: salesLicenseUrl,
            trademarkCert: trademarkCertUrl,
            distributorCert: distributorCertUrl
        };

        const res = await SellerAuthService.updateShopProfile(payload);
        toast.success("Đã lưu. Các thay đổi giấy tờ sẽ được gửi Admin duyệt.");
        if (res?.user) {
            setUser(res.user);
            // Reset files
            setAvatarFile(null); setCoverFile(null);
            setLegalDocs(prev => {
                const newState = { ...prev };
                (Object.keys(newState) as LegalDocType[]).forEach(k => newState[k].file = null);
                return newState;
            });
            toast.success("Đã lưu hồ sơ thành công!");
        }
    } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Lỗi cập nhật hồ sơ");
    } finally {
        setIsLoading(false);
        setIsUploading(false);
    }
  };

  // Nếu user chưa load xong, hiển thị skeleton hoặc loading đơn giản
  if (!user) return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;

  return (
    <div className="w-full p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ & Pháp lý Shop</h1>
        <p className="text-gray-500 text-sm">Quản lý thông tin hiển thị và giấy tờ xác minh</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* BLOCK 1: THÔNG TIN CƠ BẢN */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
            {/* Cột Form Text */}
            <div className="p-6 lg:col-span-2 space-y-6 order-2 lg:order-1">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Thông tin hiển thị</h3>
                <div className="grid gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tên Shop <span className="text-red-500">*</span></label>
                        <input {...register("shopName")} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Nhập tên shop..." />
                        {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Mô tả Shop</label>
                        <textarea {...register("description")} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none resize-none" placeholder="Giới thiệu đôi nét..." />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Địa chỉ kho hàng <span className="text-red-500">*</span></label>
                        <input {...register("pickupAddress")} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Địa chỉ lấy hàng..." />
                        {errors.pickupAddress && <p className="text-red-500 text-xs mt-1">{errors.pickupAddress.message}</p>}
                    </div>
                </div>
            </div>

            {/* Cột Hình ảnh */}
            <div className="p-6 bg-gray-50/50 flex flex-col items-center gap-6 order-1 lg:order-2">
                <h3 className="font-bold text-gray-800 w-full border-b pb-2 mb-2 text-center lg:text-left">Hình ảnh Shop</h3>
                <div className="text-center w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
                    <div onClick={() => avatarInputRef.current?.click()} className="relative group mx-auto w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 cursor-pointer">
                        <img src={avatarPreview || "/assets/default-avatar.svg"} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex flex-col items-center justify-center text-white text-xs"><span>Thay đổi</span></div>
                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'avatar')} />
                    </div>
                </div>
                <div className="w-full border-t border-gray-200 my-2"></div>
                <div className="text-center w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh bìa</label>
                    <div onClick={() => coverInputRef.current?.click()} className="relative group w-full h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-100 cursor-pointer">
                        {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Chưa có ảnh bìa</div>}
                        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'cover')} />
                    </div>
                </div>
            </div>
        </div>

        {/* BLOCK 2: THÔNG TIN PHÁP LÝ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 border-b pb-2 mb-6 flex items-center gap-2">
                <FiFileText className="text-blue-600"/> Hồ sơ pháp lý & Chứng nhận
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <LegalDocUpload 
                    label="ĐKKD (Mặt trước)" 
                    data={legalDocs.businessLicenseFront} 
                    onChange={(e) => handleLegalDocChange(e, 'businessLicenseFront')} 
                />
                <LegalDocUpload 
                    label="ĐKKD (Mặt sau)" 
                    data={legalDocs.businessLicenseBack} 
                    onChange={(e) => handleLegalDocChange(e, 'businessLicenseBack')} 
                />
                <LegalDocUpload 
                    label="Giấy phép bán hàng" 
                    data={legalDocs.salesLicense} 
                    onChange={(e) => handleLegalDocChange(e, 'salesLicense')} 
                />
                <LegalDocUpload 
                    label="Đăng ký nhãn hiệu" 
                    data={legalDocs.trademarkCert} 
                    onChange={(e) => handleLegalDocChange(e, 'trademarkCert')} 
                />
                <LegalDocUpload 
                    label="Chứng nhận đại lý" 
                    data={legalDocs.distributorCert} 
                    onChange={(e) => handleLegalDocChange(e, 'distributorCert')} 
                />
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">* Vui lòng tải lên hình ảnh rõ nét. Các thông tin này sẽ được Admin kiểm duyệt.</p>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4">
            <div className="w-full md:w-auto md:min-w-[200px]">
                <PrimaryButton disabled={isLoading}>
                    {isLoading ? (isUploading ? "Đang tải ảnh lên..." : "Đang lưu...") : "Lưu thay đổi"}
                </PrimaryButton>
            </div>
        </div>
      </form>
    </div>
  );
}

// Sub-component cho gọn và tránh re-render function
const LegalDocUpload = ({ 
  label, 
  data, 
  onChange 
}: { 
  label: string, 
  data: { preview: string | null, status?: string }, // [FIX] Thêm status?: string
  onChange: (e: any) => void 
}) => {
    return (
        <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 font-medium">{label}</label>
                {/* Hiển thị Badge nếu đang chờ duyệt */}
                {data.status === 'pending' && (
                    <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        Đang chờ duyệt
                    </span>
                )}
            </div>
            
            <label className={`cursor-pointer group relative w-full h-32 border-2 border-dashed rounded-lg transition-all flex flex-col items-center justify-center overflow-hidden ${data.status === 'pending' ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-brand-orange bg-gray-50'}`}>
                {data.preview ? (
                    <img src={data.preview} alt={label} className="w-full h-full object-contain p-1" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <FiUploadCloud size={24} className="mb-1 group-hover:text-brand-orange"/>
                        <span className="text-xs">Tải ảnh lên</span>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                
                {data.preview && (
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-medium">
                        Thay đổi
                    </div>
                )}
            </label>
        </div>
    )
}