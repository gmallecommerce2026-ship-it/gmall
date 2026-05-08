"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { 
  ChevronLeft, Store, CheckCircle2, XCircle, 
  Info, Layers, Tag, Ruler, AlertTriangle,
  FileText, Video, Play, Image as ImageIcon, Box
} from "lucide-react";
import classNames from "classnames";

import { AdminService } from "@/services/AdminService";
import { sanitizeHtml } from "@/lib/sanitize";
import { Product, ProductVariant, ProductTier } from "@/types/product"; 
import Button from "@/components/ui/Button";

// --- Helpers ---

// 1. Hàm parse Attributes an toàn (Vì BE lưu dạng JSON string)
const parseAttributes = (attrs: any) => {
    if (!attrs) return {};
    if (typeof attrs === 'object') return attrs;
    try {
        return JSON.parse(attrs);
    } catch (e) {
        return {};
    }
};

// 2. Helper map data (Giữ logic cũ của bạn + Mở rộng thêm trường mới)
const normalizeProduct = (data: any): Product & { parsedAttributes: any, systemTags: string[], videoUrls: string[], sizeChartUrl: string } => {
  if (!data) return data;
  
  const parsedAttrs = parseAttributes(data.attributes);

  return {
    ...data,
    title: data.name || data.title,
    imageUrl: (() => {
    const img = data.thumbnail || (Array.isArray(data.images) ? data.images[0] : null);
        return (typeof img === 'string' ? img : img?.url) || "/placeholder.png";
    })(),
    shopName: data.shop?.name || data.shopName || "Unknown Shop",
    shopAvatar: data.shop?.avatar || data.logo || data.shopAvatar,
    shopId: data.shop?.id || data.shopId || data.sellerId,
    variations: data.variants || data.variations || [],
    tiers: data.options?.map((opt: any) => ({
       name: opt.name,
       options: opt.values?.map((v: any) => v.value) || []
    })) || data.tiers || [],
    
    // [NEW] Các trường mở rộng
    parsedAttributes: parsedAttrs,
    systemTags: parsedAttrs.systemTags || data.systemTags || [],
    videoUrls: parsedAttrs.videos || data.videos || [],
    sizeChartUrl: parsedAttrs.sizeChart || data.sizeChart || null,
  };
};

// 3. Logic lấy tên biến thể (Giữ nguyên từ code của bạn vì nó tốt)
const getVariantName = (variant: ProductVariant, tiers?: ProductTier[]) => {
  if (!variant.tierIndex || !tiers || tiers.length === 0) return 'Mặc định';
  let indices: number[] = [];
  if (Array.isArray(variant.tierIndex)) indices = variant.tierIndex;
  else if (typeof variant.tierIndex === 'string') indices = (variant.tierIndex as string).split(',').map(Number);
  else return 'Mặc định';

  const parts = indices.map((index, tierIdx) => {
    const tier = tiers[tierIdx];
    return tier?.options?.[index]; 
  });
  return parts.filter(Boolean).join(' - ');
};

const formatPrice = (price?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

// --- Component Chính ---

export default function AdminProductApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params?.id as string;
  const isViewMode = searchParams.get('viewMode') === 'true';

  const [product, setProduct] = useState<any>(null); // Dùng any để linh hoạt với các trường mở rộng
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeMedia, setActiveMedia] = useState<{type: 'image'|'video', url: string} | null>(null);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res: any = await AdminService.getProductDetail(productId);
        const rawData = res.data || res;
        const normalized = normalizeProduct(rawData);
        setProduct(normalized);
        
        // Set default active media
        if (normalized.videoUrls.length > 0) setActiveMedia({ type: 'video', url: normalized.videoUrls[0] });
        else setActiveMedia({ type: 'image', url: normalized.imageUrl });

      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleApprove = async () => {
    if (!confirm("Xác nhận DUYỆT sản phẩm này để hiển thị lên sàn?")) return;
    try {
      setProcessing(true);
      await AdminService.approveProduct(productId, "ACTIVE");
      toast.success("Đã duyệt sản phẩm thành công!");
      router.push("/admin/products/approvals");
    } catch (error) {
      toast.error("Lỗi khi duyệt sản phẩm");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setProcessing(true);
      await AdminService.approveProduct(productId, "REJECTED", rejectReason);
      toast.success("Đã từ chối sản phẩm.");
      router.push("/admin/products/approvals");
    } catch (error) {
      toast.error("Lỗi khi từ chối sản phẩm");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;
  if (!product) return <div className="p-8 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 1. Header Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronLeft size={24} />
            </button>
            <div>
            <h1 className="text-xl font-bold text-gray-800">Kiểm duyệt sản phẩm</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">ID: {product.id}</span>
                {product.status === 'ACTIVE' ? <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold border border-green-200 flex items-center gap-1"><CheckCircle2 size={12}/> ĐANG BÁN</span> : 
                 product.status === 'REJECTED' ? <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded font-bold border border-red-200 flex items-center gap-1"><XCircle size={12}/> ĐÃ TỪ CHỐI</span> : 
                 <span className="text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded font-bold border border-yellow-200 flex items-center gap-1"><Info size={12}/> CHỜ DUYỆT</span>}
            </div>
            </div>
        </div>
        
        {/* Quick Actions Header */}
        {!isViewMode && product.status === 'PENDING' && !isRejecting && (
             <div className="flex items-center gap-3">
                 <button onClick={() => setIsRejecting(true)} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-sm border border-red-200 transition-colors">Từ chối</button>
                 <button onClick={handleApprove} disabled={processing} className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold text-sm shadow-md transition-colors">Duyệt ngay</button>
             </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === LEFT COLUMN (8 cols) === */}
        <div className="lg:col-span-8 space-y-6">

            {/* Alert Lý do từ chối */}
            {product.status === 'REJECTED' && product.rejectReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-bold text-red-700 text-sm">Sản phẩm đã bị từ chối vì:</h4>
                        <p className="text-red-600 text-sm mt-1">{product.rejectReason}</p>
                    </div>
                </div>
            )}

            {/* A. Media Gallery & Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Media Preview */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative mb-4 group">
                             {activeMedia?.type === 'video' ? (
                                 <video src={activeMedia.url} controls className="w-full h-full object-contain bg-black" />
                             ) : (
                                 <Image src={activeMedia?.url || "/placeholder.png"} alt="Preview" fill className="object-contain" />
                             )}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                             {/* Render Videos Thumbnail */}
                             {product.videoUrls.map((vid: string, idx: number) => (
                                 <div key={`v-${idx}`} onClick={() => setActiveMedia({type: 'video', url: vid})} className={classNames("w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer relative bg-black", activeMedia?.url === vid ? "border-orange-500" : "border-transparent")}>
                                     <video src={vid} className="w-full h-full object-cover opacity-60" />
                                     <div className="absolute inset-0 flex items-center justify-center text-white"><Play size={20} fill="currentColor"/></div>
                                 </div>
                             ))}
                             {/* Render Images Thumbnail */}
                             {product.images?.map((img: any, idx: number) => {
                                 const url = typeof img === 'string' ? img : img.url;
                                 return (
                                     <div key={`i-${idx}`} onClick={() => setActiveMedia({type: 'image', url: url})} className={classNames("w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer bg-gray-50 relative", activeMedia?.url === url ? "border-orange-500" : "border-transparent")}>
                                        <Image src={url} alt="thumb" fill className="object-cover" />
                                    </div>
                                 )
                             })}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <div>
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded mb-2 inline-block border border-blue-100">
                                {product.parsedAttributes.brand || product.brand || "No Brand"}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 leading-snug">{product.title}</h2>
                        </div>
                        
                        <div className="flex items-end gap-2">
                             <div className="text-3xl font-bold text-orange-600">{formatPrice(product.price)}</div>
                             {product.originalPrice && <div className="text-sm text-gray-400 line-through mb-1.5">{formatPrice(product.originalPrice)}</div>}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3 text-sm">
                             <div className="flex justify-between border-b border-gray-200 pb-2">
                                 <span className="text-gray-500">Ngành hàng</span>
                                 <span className="font-medium text-gray-900">{product.category?.name || "---"}</span>
                             </div>
                             <div className="flex justify-between border-b border-gray-200 pb-2">
                                 <span className="text-gray-500">Mã SKU/GTIN</span>
                                 <span className="font-mono text-gray-900">{product.parsedAttributes.gtin || product.variations?.[0]?.sku || "---"}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Xuất xứ</span>
                                 <span className="font-medium text-gray-900">{product.parsedAttributes.origin || "---"}</span>
                             </div>
                        </div>

                        {/* [NEW] Hiển thị System Tags */}
                        {product.systemTags.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Tag size={12}/> Thẻ phân loại (System Tags)</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.systemTags.map((tag: string, idx: number) => {
                                        // Decode URL nếu là link
                                        const label = tag.startsWith('/search') ? decodeURIComponent(tag.split('q=')[1]?.replace(/\+/g, ' ')) : tag;
                                        return (
                                            <span key={idx} className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-medium">
                                                {label}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* B. Variants & Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2"><Layers size={18} className="text-blue-600"/> Phân loại & Kho hàng</h3>
                     <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-600">Tổng kho: {product.stockTotal || product.stock}</span>
                 </div>
                 <div className="p-6">
                     {/* 1. Tiers display */}
                     {product.tiers?.length > 0 && (
                         <div className="flex gap-6 mb-6">
                             {product.tiers.map((tier: any, idx: number) => (
                                 <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[150px]">
                                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">{tier.name}</div>
                                     <div className="text-sm font-medium text-gray-800">{tier.options.join(', ')}</div>
                                 </div>
                             ))}
                         </div>
                     )}

                     {/* 2. Variants Table */}
                     {product.variations?.length > 0 ? (
                         <div className="border border-gray-200 rounded-lg overflow-hidden">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-gray-100 text-gray-600 font-semibold uppercase text-xs">
                                     <tr>
                                         <th className="px-4 py-3">Biến thể</th>
                                         <th className="px-4 py-3">Hình ảnh</th>
                                         <th className="px-4 py-3">SKU</th>
                                         <th className="px-4 py-3 text-right">Giá bán</th>
                                         <th className="px-4 py-3 text-right">Kho</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {product.variations.map((v: any, idx: number) => {
                                         const name = getVariantName(v, product.tiers);
                                         return (
                                             <tr key={idx} className="hover:bg-gray-50">
                                                 <td className="px-4 py-3 font-medium text-gray-900">{name}</td>
                                                 <td className="px-4 py-3">
                                                     {v.image ? <div className="w-8 h-8 rounded border bg-gray-50 relative overflow-hidden"><Image src={v.image} fill className="object-cover" alt="" /></div> : <span className="text-gray-400 text-xs">--</span>}
                                                 </td>
                                                 <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.sku || "---"}</td>
                                                 <td className="px-4 py-3 text-right text-orange-600 font-bold">{formatPrice(v.price)}</td>
                                                 <td className="px-4 py-3 text-right">{v.stock}</td>
                                             </tr>
                                         )
                                     })}
                                 </tbody>
                             </table>
                         </div>
                     ) : (
                        <div className="text-center p-8 bg-gray-50 rounded border border-dashed text-gray-500 italic">Sản phẩm này không có biến thể</div>
                     )}
                 </div>
            </div>

            {/* C. Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Mô tả chi tiết</h3>
                </div>
                <div className="p-6">
                    {/* Fix BUG-FE-3 (wiki 0030): sanitize TRƯỚC KHI hiện cho admin —
                        admin có cookie quyền cao, XSS payload từ seller sẽ chạy với
                        session admin → critical security risk. */}
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={sanitizeHtml(product.description || "<em>Chưa có mô tả</em>")} />
                </div>
            </div>
        </div>

        {/* === RIGHT COLUMN (4 cols) === */}
        <div className="lg:col-span-4 space-y-6">

             {/* 1. Shop Card */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Store size={14}/> Thông tin người bán</h3>
                 <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 rounded-full border bg-gray-50 relative overflow-hidden shrink-0">
                         {product.shopAvatar ? <Image src={product.shopAvatar} alt="Shop" fill className="object-cover"/> : <div className="flex items-center justify-center h-full font-bold text-gray-400">S</div>}
                     </div>
                     <div className="overflow-hidden">
                         <div className="font-bold text-gray-900 truncate">{product.shopName}</div>
                         <Link href={`/admin/shops/${product.shopId}`} className="text-xs text-blue-600 hover:underline">Xem hồ sơ cửa hàng</Link>
                     </div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 border border-gray-100">
                     <div>ID: <span className="font-mono text-gray-700">{product.shopId}</span></div>
                 </div>
             </div>

             {/* 2. Specifications */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Info size={14}/> Thuộc tính chi tiết</h3>
                 <div className="space-y-3 text-sm">
                     <div className="flex justify-between pb-2 border-b border-gray-50">
                         <span className="text-gray-500">Chất liệu</span>
                         <span className="font-medium">{product.parsedAttributes.material || "--"}</span>
                     </div>
                     <div className="flex justify-between pb-2 border-b border-gray-50">
                         <span className="text-gray-500">Kiểu dáng</span>
                         <span className="font-medium">{product.parsedAttributes.style || "--"}</span>
                     </div>
                     <div className="flex justify-between pb-2 border-b border-gray-50">
                         <span className="text-gray-500">Tình trạng</span>
                         <span className="font-medium">
                             {product.parsedAttributes.condition === 'new' ? 'Mới 100%' : `Đã dùng (${product.parsedAttributes.conditionPercent}%)`}
                         </span>
                     </div>
                     {/* Các thuộc tính động khác trong JSON */}
                     {Object.entries(product.parsedAttributes).map(([key, val]) => {
                         if (['systemTags','videos','sizeChart','brand','origin','material','style','gtin','condition','conditionPercent','dimensions','weight'].includes(key)) return null;
                         return (
                             <div key={key} className="flex justify-between pb-2 border-b border-gray-50 last:border-0">
                                 <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                 <span className="font-medium truncate max-w-[150px]">{String(val)}</span>
                             </div>
                         )
                     })}
                 </div>
             </div>

             {/* 3. Shipping & Dimensions */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Box size={14}/> Vận chuyển</h3>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-3 rounded border border-gray-100">
                         <div className="text-xs text-gray-400 mb-1">Cân nặng</div>
                         <div className="font-bold text-gray-800">{product.weight || product.parsedAttributes.weight || 0} g</div>
                     </div>
                     <div className="bg-gray-50 p-3 rounded border border-gray-100">
                         <div className="text-xs text-gray-400 mb-1">Kích thước</div>
                         <div className="font-bold text-gray-800">
                             {product.length || product.parsedAttributes?.dimensions?.length || 0} x {product.width || product.parsedAttributes?.dimensions?.width || 0} x {product.height || product.parsedAttributes?.dimensions?.height || 0} cm
                         </div>
                     </div>
                 </div>
             </div>

             {/* 4. Size Chart */}
             {product.sizeChartUrl && (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                     <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Ruler size={14}/> Bảng quy đổi kích cỡ</h3>
                     <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(product.sizeChartUrl, '_blank')}>
                         <Image src={product.sizeChartUrl} alt="Size Chart" width={400} height={300} className="w-full h-auto object-contain" />
                     </div>
                 </div>
             )}

             {/* 5. Sticky Actions (Only for PENDING & Not ViewMode) */}
             {!isViewMode && (
                 <div className="sticky top-24 bg-white rounded-xl shadow-lg shadow-blue-100 border-2 border-blue-50 p-5 animate-in fade-in slide-in-from-bottom-4">
                     <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 border-b pb-2">Hành động</h3>
                     
                     {isRejecting ? (
                         <div className="animate-in zoom-in duration-200">
                             <label className="text-xs font-bold text-red-600 mb-2 block">Lý do từ chối:</label>
                             <textarea 
                                 className="w-full border border-red-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none mb-3 bg-red-50/30"
                                 rows={4}
                                 autoFocus
                                 placeholder="Nhập lý do vi phạm (VD: Ảnh mờ, Sai danh mục...)"
                                 value={rejectReason}
                                 onChange={(e) => setRejectReason(e.target.value)}
                             ></textarea>
                             <div className="flex gap-2">
                                 <button onClick={handleReject} disabled={processing} className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-red-700">Xác nhận</button>
                                 <button onClick={() => setIsRejecting(false)} disabled={processing} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm hover:bg-gray-200">Hủy</button>
                             </div>
                         </div>
                     ) : (
                         <div className="space-y-3">
                             {product.status === 'PENDING' ? (
                                 <>
                                     <button onClick={handleApprove} disabled={processing} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                                         <CheckCircle2 size={18}/> Duyệt sản phẩm
                                     </button>
                                     <button onClick={() => setIsRejecting(true)} disabled={processing} className="w-full bg-white text-red-600 font-bold py-3 rounded-lg border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors">
                                         <XCircle size={18}/> Từ chối / Yêu cầu sửa
                                     </button>
                                 </>
                             ) : (
                                 <div className="text-center p-4 bg-gray-50 rounded text-gray-500 text-sm">
                                     Sản phẩm này đã được xử lý ({product.status}).
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
             )}

        </div>

      </div>
    </div>
  );
}