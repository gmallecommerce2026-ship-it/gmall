// src/components/admin/approvals/SellerDossierModal.tsx
"use client";
import React, { useState } from "react";
import { FiX, FiCheck, FiXCircle, FiUser, FiMapPin, FiPhone, FiMail, FiBriefcase, FiFileText, FiCalendar } from "react-icons/fi";
import { AdminShop } from "@/types/admin"; // Đảm bảo import đúng type

interface SellerDossierModalProps {
  shop: any; // Hoặc AdminShop nếu data mapping khớp hoàn toàn
  type: 'register' | 'update';
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

// hooks-fix wiki 0031: move InfoRow ra ngoài (was static-components — component định
// nghĩa trong render reset state mỗi lần render)
const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="mt-1 text-gray-400"><Icon size={18} /></div>
    <div>
      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{label}</p>
      <p className="text-gray-800 font-medium mt-0.5">{value || "---"}</p>
    </div>
  </div>
);

export const SellerDossierModal = ({ shop, type, onClose, onApprove, onReject }: SellerDossierModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'legal'>('info');

  // Helper lấy ảnh (Support logic cũ của bạn)
  const getDocImage = (field: string) => {
    if (type === 'update' && shop.pendingDetails?.[field]) {
      return { src: shop.pendingDetails[field], isNew: true };
    }
    return { src: shop[field], isNew: false };
  };

  const docFields = [
    { key: 'businessLicenseFront', label: 'GPKD (Mặt trước)' },
    { key: 'businessLicenseBack', label: 'GPKD (Mặt sau)' },
    { key: 'salesLicense', label: 'Giấy phép bán hàng' },
    { key: 'trademarkCert', label: 'Chứng nhận thương hiệu' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* --- HEADER HỒ SƠ --- */}
        <div className="relative h-40 bg-gradient-to-r from-slate-800 to-slate-900 shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur transition-all">
                <FiX size={24} />
            </button>
            <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden">
                    <img 
                        src={shop.logo || "https://via.placeholder.com/150?text=No+Logo"} 
                        alt="Shop Logo" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="mb-4">
                    <h2 className="text-3xl font-bold text-white shadow-black drop-shadow-md">{shop.name}</h2>
                    <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${type === 'register' ? 'bg-green-500' : 'bg-orange-500'}`}>
                            {type === 'register' ? 'YÊU CẦU MỞ MỚI' : 'YÊU CẦU CẬP NHẬT'}
                        </span>
                        <span className="opacity-80">| ID: {shop.id}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- BODY --- */}
        <div className="flex flex-1 overflow-hidden pt-16">
            
            {/* Sidebar Trái: Thông tin liên hệ */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-8 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiUser className="text-blue-600"/> Chủ sở hữu
                </h3>
                
                <div className="space-y-1">
                    <InfoRow icon={FiUser} label="Họ và tên" value={shop.owner?.name} />
                    <InfoRow icon={FiMail} label="Email" value={shop.owner?.email} />
                    <InfoRow icon={FiPhone} label="Số điện thoại" value={shop.phone || shop.owner?.phone} />
                    <InfoRow icon={FiMapPin} label="Địa chỉ đăng ký" value={shop.address || "Chưa cập nhật"} />
                    <InfoRow icon={FiCalendar} label="Ngày đăng ký" value={new Date(shop.createdAt).toLocaleDateString('vi-VN')} />
                </div>

                <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                    <strong>Ghi chú hệ thống:</strong>
                    <p className="mt-1 opacity-80">
                        {type === 'register' 
                            ? "Shop này đang chờ duyệt lần đầu. Hãy kiểm tra kỹ giấy phép kinh doanh." 
                            : "Shop yêu cầu cập nhật thông tin pháp lý. Những trường có nhãn 'Mới' là dữ liệu thay đổi."}
                    </p>
                </div>
            </div>

            {/* Content Phải: Tab Hồ sơ & Giấy tờ */}
            <div className="w-2/3 flex flex-col bg-white">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-8">
                    <button 
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-2 mr-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="flex items-center gap-2"><FiBriefcase/> Thông tin Shop</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('legal')}
                        className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'legal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="flex items-center gap-2"><FiFileText/> Giấy tờ pháp lý (Dossier)</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8 flex-1 overflow-y-auto bg-gray-50/50">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả giới thiệu</label>
                                <div className="p-4 bg-white border border-gray-200 rounded-lg text-gray-600 min-h-[100px]">
                                    {shop.description || "Chưa có mô tả..."}
                                </div>
                            </div>
                            
                            {/* Stats nhỏ nếu cần */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="text-gray-500 text-xs uppercase font-bold">Loại hình</div>
                                    <div className="font-medium text-lg">Cá nhân / Hộ kinh doanh</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="text-gray-500 text-xs uppercase font-bold">Trạng thái</div>
                                    <div className="font-medium text-lg text-yellow-600">Đang chờ duyệt</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'legal' && (
                        <div className="grid grid-cols-2 gap-6">
                            {docFields.map((field) => {
                                const { src, isNew } = getDocImage(field.key);
                                if (!src) return null;

                                return (
                                    <div key={field.key} className={`group relative bg-white p-3 rounded-xl border-2 transition-all ${isNew ? 'border-orange-400 shadow-orange-100 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-gray-700">{field.label}</span>
                                            {isNew && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide animate-pulse">Updated</span>}
                                        </div>
                                        <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in border border-gray-100">
                                            <img src={src} alt={field.label} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                                        </div>
                                        {/* Nút xem nhanh nếu cần */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl pointer-events-none"/>
                                    </div>
                                )
                            })}
                            
                            {/* Fallback nếu không có giấy tờ */}
                            {!docFields.some(f => getDocImage(f.key).src) && (
                                <div className="col-span-2 py-12 text-center text-gray-400 italic bg-white border border-dashed border-gray-300 rounded-xl">
                                    Không tìm thấy giấy tờ pháp lý nào được tải lên.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- FOOTER ACTION --- */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
             <div className="text-sm text-gray-500 italic px-4">
                * Vui lòng kiểm tra kỹ giấy tờ đối chiếu với thông tin chủ sở hữu trước khi duyệt.
             </div>
             <div className="flex gap-3">
                <button 
                    onClick={onReject}
                    className="px-6 py-2.5 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-2 transition-all"
                >
                    <FiXCircle /> Từ chối hồ sơ
                </button>
                <button 
                    onClick={onApprove}
                    className="px-6 py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all transform active:scale-95"
                >
                    <FiCheck /> {type === 'register' ? 'Phê duyệt hoạt động' : 'Xác nhận thay đổi'}
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};