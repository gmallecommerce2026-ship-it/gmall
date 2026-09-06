"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { 
  ChevronLeft, MapPin, Phone, Mail, 
  Star, ShieldCheck, FileText, ExternalLink
} from "lucide-react";

import Button from "@/components/ui/Button";
import { ShopService } from "@/services/shop.service";

// Interface mở rộng
interface AdminShopDetail {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  rating: number;
  totalProducts: number;
  followers: number;
  createdAt: string;
  owner: {
    fullName: string;
    email: string;
    phone?: string;
  };
  address?: string;
  // Các trường mới
  businessLicenseFront?: string;
  businessLicenseBack?: string;
  salesLicense?: string;
  trademarkCert?: string;
  distributorCert?: string;
}

export default function AdminShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.id as string;

  const [shop, setShop] = useState<AdminShopDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    const fetchShop = async () => {
      try {
        setLoading(true);
        const res: any = await ShopService.getShopProfile(shopId);
        // [FIX wiki 0095/0099/0103] `ShopService.getShopProfile` trả THẲNG `null` khi shop
        // không tồn tại hoặc call lỗi (xem shop.service.ts), nên `res.data` ném TypeError.
        // BE trả object shop ở top level (không bọc `data`) → `res?.data ?? res` lấy đúng
        // object; `null` thì nhánh "Không tìm thấy Shop" bên dưới lo hiển thị.
        setShop(res?.data ?? res ?? null);
      } catch (error) {
        console.error("Failed to fetch shop:", error);
        toast.error("Không thể tải thông tin Shop");
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [shopId]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (!shop) return (
    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-gray-700">Không tìm thấy Shop</h2>
      <Button variant="secondary" onClick={() => router.back()} className="mt-4">Quay lại</Button>
    </div>
  );

  // Helper render ô ảnh giấy phép
  const LegalDocCard = ({ title, url }: { title: string, url?: string }) => {
    if (!url) return null;
    return (
        <div className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-600 truncate" title={title}>{title}</p>
            <div className="relative w-full h-32 bg-white rounded border border-gray-200 overflow-hidden group cursor-pointer"
                 onClick={() => window.open(url, '_blank')}>
                <Image src={url} alt={title} fill className="object-contain" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={20}/>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header (Giữ nguyên) */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Hồ sơ Cửa hàng</h1>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Banner & Header Info (Giữ nguyên) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
             {shop.banner && <Image src={shop.banner} alt="Cover" fill className="object-cover opacity-80" />}
          </div>
          <div className="px-8 pb-6 relative">
             <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="flex items-end gap-4">
                   <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md relative overflow-hidden">
                      {shop.logo ? (
                        <Image src={shop.logo} alt="Logo" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl font-bold text-gray-400">
                          {shop.name.charAt(0)}
                        </div>
                      )}
                   </div>
                   <div className="mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${shop.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {shop.status}
                         </span>
                         <span>• ID: {shop.id}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-3">
                   <Button variant="secondary">Khóa Shop</Button>
                   <Button variant="primary">Liên hệ</Button>
                </div>
             </div>
             
             {/* Shop Stats Grid (Giữ nguyên) */}
             <div className="grid grid-cols-4 gap-4 border-t pt-6">
                <div className="text-center">
                   <div className="text-gray-500 text-xs uppercase mb-1">Đánh giá</div>
                   <div className="font-bold text-xl flex items-center justify-center gap-1">
                      {shop.rating} <Star size={16} className="text-yellow-400 fill-yellow-400"/>
                   </div>
                </div>
                <div className="text-center border-l">
                   <div className="text-gray-500 text-xs uppercase mb-1">Sản phẩm</div>
                   <div className="font-bold text-xl">{shop.totalProducts}</div>
                </div>
                <div className="text-center border-l">
                   <div className="text-gray-500 text-xs uppercase mb-1">Người theo dõi</div>
                   <div className="font-bold text-xl">{shop.followers || 0}</div>
                </div>
                <div className="text-center border-l">
                   <div className="text-gray-500 text-xs uppercase mb-1">Tham gia</div>
                   <div className="font-bold text-lg">{new Date(shop.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Left: Contact Info (Giữ nguyên) */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                 <h3 className="font-bold text-gray-800 mb-4">Thông tin liên hệ</h3>
                 <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={18}/></div>
                       <div>
                          <p className="text-gray-500 text-xs">Địa chỉ kho</p>
                          <p className="font-medium">{shop.address || "Chưa cập nhật"}</p>
                       </div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Phone size={18}/></div>
                       <div>
                          <p className="text-gray-500 text-xs">Điện thoại</p>
                          <p className="font-medium">{shop.owner?.phone || "Chưa cập nhật"}</p>
                       </div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Mail size={18}/></div>
                       <div>
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="font-medium break-all">{shop.owner?.email}</p>
                       </div>
                    </li>
                 </ul>
              </div>
           </div>

           {/* Right: Description & Legal Docs (CẬP NHẬT) */}
           <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                 <h3 className="font-bold text-gray-800 mb-3">Giới thiệu Shop</h3>
                 <p className="text-gray-600 text-sm leading-relaxed">
                    {shop.description || "Shop chưa cập nhật mô tả giới thiệu."}
                 </p>
              </div>

              {/* SECTION MỚI: GIẤY TỜ PHÁP LÝ */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="text-orange-600" size={20}/> Hồ sơ pháp lý & Giấy phép
                 </h3>
                 
                 {/* Kiểm tra xem có giấy tờ nào không */}
                 {(!shop.businessLicenseFront && !shop.salesLicense && !shop.trademarkCert && !shop.distributorCert) ? (
                     <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed text-gray-500 text-sm">
                        Shop chưa tải lên giấy tờ xác minh.
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <LegalDocCard title="ĐKKD (Mặt trước)" url={shop.businessLicenseFront} />
                        <LegalDocCard title="ĐKKD (Mặt sau)" url={shop.businessLicenseBack} />
                        <LegalDocCard title="Giấy phép bán hàng" url={shop.salesLicense} />
                        <LegalDocCard title="Đăng ký nhãn hiệu" url={shop.trademarkCert} />
                        <LegalDocCard title="Chứng nhận đại lý" url={shop.distributorCert} />
                     </div>
                 )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-green-600" size={20}/> Trạng thái vận hành
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                       <p className="text-sm text-gray-500">Vi phạm tháng này</p>
                       <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                       <p className="text-sm text-gray-500">Tỉ lệ phản hồi chat</p>
                       <p className="text-2xl font-bold text-green-600">98%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}