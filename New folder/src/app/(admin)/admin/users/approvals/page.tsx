'use client';

import React, { useEffect, useState } from 'react';
import { FiCheck, FiX, FiClock, FiMapPin, FiPhone, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { AdminService } from '@/services/AdminService';
import { toast } from 'react-hot-toast'; // Giả sử bạn có cài react-hot-toast hoặc dùng library khác

// Định nghĩa Interface cho dữ liệu trả về từ API
interface PendingSeller {
  id: string;
  name: string; // Tên Shop hoặc tên User
  email: string;
  createdAt: string;
  // Các field optional nếu BE chưa trả về
  phone?: string;
  address?: string;
  docs?: string[]; 
}

export default function SellerApprovalPage() {
  const [requests, setRequests] = useState<PendingSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Hàm fetch dữ liệu
  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const res: any = await AdminService.getPendingSellers(1, 50); // Lấy 50 item đầu
      // Tùy vào cấu trúc response của bạn, ở đây giả sử res.data.data là mảng user
      const mappedData = res.data?.data || res.data || []; 
      setRequests(mappedData);
    } catch (error) {
      console.error('Failed to fetch:', error);
      toast.error('Không thể tải danh sách chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  // Xử lý Duyệt
  const handleApprove = async (id: string) => {
    if (!confirm('Bạn có chắc muốn duyệt người bán này?')) return;
    setProcessingId(id);
    try {
      await AdminService.approveSeller(id);
      toast.success('Đã duyệt thành công!');
      // Update UI local để không cần F5
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt.');
    } finally {
      setProcessingId(null);
    }
  };

  // Xử lý Từ chối
  const handleReject = async (id: string) => {
    if (!confirm('Bạn muốn từ chối yêu cầu này?')) return;
    setProcessingId(id);
    try {
      await AdminService.rejectSeller(id);
      toast.success('Đã từ chối yêu cầu.');
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      toast.error('Có lỗi xảy ra.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Duyệt đăng ký người bán</h1>
            <p className="text-gray-500 text-sm">Quản lý các yêu cầu nâng cấp tài khoản lên Seller.</p>
          </div>
          <button 
            onClick={fetchPendingSellers} 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            title="Tải lại"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
       </div>

       {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
       ) : requests.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">Hiện không có yêu cầu nào đang chờ duyệt.</p>
          </div>
       ) : (
         <div className="grid grid-cols-1 gap-6">
           {requests.map(req => (
             <div key={req.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col lg:flex-row gap-6">
               
               {/* Info Section */}
               <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-800">{req.name || 'Người dùng chưa đặt tên'}</h3>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex items-center gap-1">
                              <FiClock size={10} /> Chờ duyệt
                          </span>
                       </div>
                       <p className="text-gray-500 text-sm">Ngày đăng ký: {new Date(req.createdAt).toLocaleString('vi-VN')}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                     <div className="flex items-center gap-2 text-gray-700">
                         <span className="font-semibold w-24">Email:</span> 
                         {req.email}
                     </div>
                     <div className="flex items-center gap-2 text-gray-700">
                        <FiPhone className="text-gray-400" /> {req.phone || 'Chưa cập nhật'}
                     </div>
                     <div className="flex items-center gap-2 text-gray-700">
                         <FiMapPin className="text-gray-400" /> {req.address || 'Chưa cập nhật'}
                     </div>
                  </div>

                  {/* Mock docs section - Backend cần trả về list file nếu có */}
                  {req.docs && req.docs.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Tài liệu đính kèm:</p>
                      <div className="flex gap-3">
                          {req.docs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded text-sm text-blue-600 hover:bg-blue-50 cursor-pointer">
                              <FiFileText /> {doc}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
               </div>

               {/* Action Section */}
               <div className="lg:w-64 flex flex-col justify-center gap-3 lg:border-l lg:border-gray-100 lg:pl-6">
                  <button 
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                     {processingId === req.id ? 'Đang xử lý...' : <><FiCheck /> Chấp thuận</>}
                  </button>
                  
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="w-full py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                     <FiX /> Từ chối
                  </button>
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}