'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, ChevronRight, Search, Plus, Trash2, 
  AlertCircle, CheckCircle2, ArrowLeft, Save, Loader2 
} from 'lucide-react';
// Giả sử bạn có api client, nếu không hãy dùng fetch/axios
import { apiClient, ApiClient } from '@/lib/api/ApiClient'; 
import { toast } from 'react-hot-toast'; // Hoặc thư viện notify của bạn
import FlashSaleProductSelector from '@/modules/seller/products/components/FlashSaleProductSelector';

// --- Types ---

type FlashSaleStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';
type TabType = 'AVAILABLE' | 'REGISTERED' | 'ENDED';

interface FlashSaleSession {
  id: string;
  startTime: string;
  endTime: string;
  status: FlashSaleStatus;
  _count?: { products: number };
}

// Cấu trúc item trong form đăng ký
interface RegisterItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  originalPrice: number;
  currentStock: number;
  imageUrl: string;
  // Input fields
  promoPrice: number | '';
  promoStock: number | '';
  isEnabled: boolean;
}

// --- Utilities ---
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getHours()}:00 ${date.getDate()}/${date.getMonth() + 1}`;
};

// --- Components ---

/**
 * 1. Màn hình danh sách Session
 */
const SessionList = ({ onSelectSession }: { onSelectSession: (s: FlashSaleSession) => void }) => {
  const [activeTab, setActiveTab] = useState<TabType>('AVAILABLE');
  const [sessions, setSessions] = useState<FlashSaleSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        // CALL API: GET /seller/flash-sale/sessions
        const res = await apiClient.get('/seller/flash-sale/sessions'); 
        setSessions(res || []);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
        // Fallback mock nếu API chưa sẵn sàng
        setSessions([
        { 
          id: '00000000-0000-0000-0000-000000000000', // <--- SỬA THÀNH UUID 
          startTime: new Date(Date.now() + 86400000).toISOString(), 
          endTime: new Date(Date.now() + 90000000).toISOString(), 
          status: 'UPCOMING', 
          _count: { products: 0 } 
        }
      ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [activeTab]); // Thực tế có thể filter theo tab ở API

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex border-b border-gray-200">
        {[{ key: 'AVAILABLE', label: 'Sắp diễn ra' }, { key: 'REGISTERED', label: 'Đã đăng ký' }, { key: 'ENDED', label: 'Đã kết thúc' }]
        .map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
           <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Không có chương trình nào.</div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-all bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-md text-blue-600"><Clock size={24} /></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {formatDate(session.startTime)} - {formatDate(session.endTime)}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        {session.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đang diễn ra'}
                      </span>
                      <span>• {session._count?.products || 0} sản phẩm đã đăng ký</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onSelectSession(session)}
                  className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                  Đăng ký ngay <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 2. Màn hình Form đăng ký (Tích hợp Modal Selector)
 */
const RegistrationForm = ({ session, onBack }: { session: FlashSaleSession; onBack: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<RegisterItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchRegisteredProducts = async () => {
      setIsLoadingData(true);
      try {
        // Gọi API Backend vừa tạo
        const res: any = await apiClient.get(`/seller/flash-sale/sessions/${session.id}/products`);
        
        if (Array.isArray(res)) {
          // Map dữ liệu từ DB (FlashSaleProduct) sang UI state (RegisterItem)
          const mappedItems: RegisterItem[] = res.map((item: any) => {
            // Xác định ảnh: Ưu tiên ảnh variant -> ảnh product
            const prodImage = Array.isArray(item.product.images) 
                ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url) 
                : item.product.image;
            
            const variantImage = item.variant?.image;

            return {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantName: item.variant?.name || item.variant?.title || 'Mặc định',
              originalPrice: Number(item.originalPrice),
              currentStock: item.productVariant ? item.productVariant.stock : item.product.stock, // Lấy tồn kho hiện tại thực tế
              imageUrl: variantImage || prodImage || '/placeholder.png',
              
              // Dữ liệu đã đăng ký
              promoPrice: Number(item.salePrice),
              promoStock: Number(item.stock),
              isEnabled: item.status === 'APPROVED' || item.status === 'PENDING', // Giả sử status
            };
          });
          setSelectedItems(mappedItems);
        }
      } catch (error) {
        console.error("Failed to fetch registered products", error);
        toast.error("Không thể tải dữ liệu đã đăng ký");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (session.id) {
        fetchRegisteredProducts();
    }
  }, [session.id]);
  // Xử lý khi user chọn sản phẩm từ Modal
  const handleProductsSelected = (products: any[]) => {
  const newItems: RegisterItem[] = [];
  
  products.forEach(prod => {
    // Lưu ý: prod.variants bây giờ CHỈ CHỨA các variants người dùng đã tick chọn từ Modal
    const selectedVariants = Array.isArray(prod.variants) ? prod.variants : []; 

    // TRƯỜNG HỢP 1: Sản phẩm có variants (đã filter)
    if (selectedVariants.length > 0) {
      selectedVariants.forEach((v: any) => {
         // Check trùng dựa trên variantId đã có trong danh sách hiện tại
         if (!selectedItems.some(item => item.variantId === v.id)) {
            newItems.push({
              productId: prod.id,
              variantId: v.id, // ID chính xác của variant
              productName: prod.name,
              variantName: v.name || v.title || 'Phân loại',
              originalPrice: Number(v.price) || 0,
              currentStock: Number(v.stock) || 0,
              // Xử lý ảnh: Variant image > Product image > Placeholder
              imageUrl: v.image || (Array.isArray(prod.images) ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url) : prod.image) || '/placeholder.png',
              promoPrice: '',
              promoStock: '',
              isEnabled: true,
            });
         }
      });
    } 
    // TRƯỜNG HỢP 2: Simple Product (được chọn trực tiếp)
    else {
       // Chỉ add nếu trong danh sách selectedVariantIds của modal có chứa prod.id (nhưng modal đã filter products rồi nên đến đây là an toàn)
       if (!selectedItems.some(item => item.productId === prod.id)) {
          newItems.push({
              productId: prod.id,
              variantId: prod.id, // Với simple product, variantId = productId
              productName: prod.name,
              variantName: 'Mặc định',
              originalPrice: Number(prod.price) || 0,
              currentStock: Number(prod.stock) || 0,
              imageUrl: Array.isArray(prod.images) ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url) : (prod.image || '/placeholder.png'),
              promoPrice: '',
              promoStock: '',
              isEnabled: true,
          });
       }
    }
  });

  if (newItems.length > 0) {
      setSelectedItems(prev => [...prev, ...newItems]);
      toast.success(`Đã thêm ${newItems.length} phân loại sản phẩm!`);
  } else {
      toast('Các sản phẩm/phân loại đã chọn đều đã có trong danh sách.');
  }
};

  const handleRemoveItem = (variantId: string) => {
    setSelectedItems(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateItem = (variantId: string, field: keyof RegisterItem, value: any) => {
    setSelectedItems(prev => prev.map(item => item.variantId === variantId ? { ...item, [field]: value } : item));
  };

  const calculateDiscount = (original: number, promo: number | '') => {
    if (!promo || promo >= original) return 0;
    return Math.round(((original - promo) / original) * 100);
  };

  const validateForm = () => {
    let isValid = true;
    for (const item of selectedItems) {
      if (!item.isEnabled) continue;
      if (!item.promoPrice || Number(item.promoPrice) >= item.originalPrice) return { isValid: false, errorMsg: `Sản phẩm "${item.variantName}" giá chưa hợp lệ.` };
      if (!item.promoStock || Number(item.promoStock) <= 0 || Number(item.promoStock) > item.currentStock) return { isValid: false, errorMsg: `Sản phẩm "${item.variantName}" số lượng không hợp lệ.` };
    }
    return { isValid: true, errorMsg: '' };
  };

  const handleSubmit = async () => {
    // 1. Kiểm tra danh sách rỗng
    if (selectedItems.length === 0) {
        return toast.error('Vui lòng chọn ít nhất một sản phẩm');
    }

    // 2. Validate dữ liệu nhập vào (Giá & Số lượng)
    // Lưu ý: Người dùng PHẢI nhập giá vào bảng trước khi ấn Xác nhận
    const { isValid, errorMsg } = validateForm();
    if (!isValid) {
        // Hiển thị lỗi rõ ràng
        toast.error(errorMsg || 'Vui lòng kiểm tra lại giá và số lượng');
        return;
    }

    setSubmitting(true);
    try {
        // Chuẩn bị payload đúng theo DTO Backend yêu cầu
        const payload = {
            sessionId: session.id,
            items: selectedItems
                .filter(i => i.isEnabled)
                .map(i => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    // Convert sang Number để tránh gửi string '' lên server
                    promoPrice: Number(i.promoPrice), 
                    promoStock: Number(i.promoStock)
                }))
        };

        console.log('Submitting Payload:', payload); // Debug log

        // Gọi API - Đảm bảo đường dẫn khớp với SellerFlashSaleController vừa tạo
        await apiClient.post('/seller/flash-sale/register', payload);
      
        toast.success('Đăng ký Flash Sale thành công!');
        onBack(); // Quay lại danh sách
    } catch (error: any) {
        console.error("Submit Error:", error);
        // Hiển thị thông báo lỗi chi tiết từ Backend nếu có
        const message = error?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
        toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
        setSubmitting(false);
    }
};

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Đăng ký sản phẩm</h2>
            <p className="text-sm text-gray-500">{formatDate(session.startTime)} - {formatDate(session.endTime)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-medium"
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm text-sm font-medium disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Xác nhận đăng ký</>}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
        {isLoadingData ? (
            <div className="flex flex-col justify-center items-center h-[400px]">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Đang tải danh sách đã đăng ký...</p>
            </div>
        ) : selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
            <Search size={48} className="mb-4 text-gray-300" />
            <p>Chưa có sản phẩm nào được chọn.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 hover:underline font-medium">
              + Thêm sản phẩm từ kho
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <tr>
                  <th className="p-4 border-b w-[350px]">Sản phẩm / Phân loại</th>
                  <th className="p-4 border-b text-right w-[120px]">Giá gốc</th>
                  <th className="p-4 border-b text-center w-[100px]">Tồn kho</th>
                  <th className="p-4 border-b w-[200px]">Giá khuyến mãi</th>
                  <th className="p-4 border-b w-[150px]">SL Khuyến mãi</th>
                  <th className="p-4 border-b text-center w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {selectedItems.map((item) => {
                  const discount = calculateDiscount(item.originalPrice, item.promoPrice);
                  const isPriceError = item.promoPrice !== '' && Number(item.promoPrice) >= item.originalPrice;
                  const isStockError = item.promoStock !== '' && Number(item.promoStock) > item.currentStock;

                  return (
                    <tr key={item.variantId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="flex gap-3">
                          <img src={item.imageUrl || '/placeholder.png'} alt="" className="w-12 h-12 rounded object-cover border" />
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1" title={item.productName}>{item.productName}</p>
                            <p className="text-gray-500 mt-1 text-xs bg-gray-100 inline-block px-1.5 py-0.5 rounded">Phân loại: {item.variantName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right align-top text-gray-500">{formatCurrency(item.originalPrice)}</td>
                      <td className="p-4 text-center align-top text-gray-500">{item.currentStock}</td>
                      <td className="p-4 align-top">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₫</span>
                          <input
                            type="number"
                            value={item.promoPrice}
                            onChange={(e) => updateItem(item.variantId, 'promoPrice', e.target.value)}
                            className={`w-full pl-6 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                              isPriceError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                            }`}
                            placeholder="Nhập giá"
                          />
                        </div>
                        {item.promoPrice !== '' && !isPriceError && (
                          <div className="mt-1 text-xs font-medium text-green-600 flex items-center gap-1">Giảm {discount}% <CheckCircle2 size={12} /></div>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <input
                          type="number"
                          value={item.promoStock}
                          onChange={(e) => updateItem(item.variantId, 'promoStock', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                            isStockError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                          }`}
                          placeholder="SL bán"
                        />
                      </td>
                      <td className="p-4 text-center align-top">
                        <button onClick={() => handleRemoveItem(item.variantId)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FlashSaleProductSelector 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleProductsSelected}
        excludeIds={selectedItems.map(i => i.productId)} // Tùy chọn: disable SP đã chọn
      />
    </div>
  );
};

export default function FlashSalePage() {
  const [view, setView] = useState<'LIST' | 'REGISTER'>('LIST');
  const [selectedSession, setSelectedSession] = useState<FlashSaleSession | null>(null);

  const handleSelectSession = (session: FlashSaleSession) => {
    setSelectedSession(session);
    setView('REGISTER');
  };

  const handleBack = () => {
    setSelectedSession(null);
    setView('LIST');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flash Sale của Shop</h1>
        <p className="text-gray-500 mt-1">Đăng ký sản phẩm vào các khung giờ Flash Sale của sàn.</p>
      </div>

      {view === 'LIST' ? (
        <SessionList onSelectSession={handleSelectSession} />
      ) : (
        selectedSession && <RegistrationForm session={selectedSession} onBack={handleBack} />
      )}
    </div>
  );
}