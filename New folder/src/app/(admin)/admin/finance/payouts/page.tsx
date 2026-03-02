'use client';

import React from 'react';
import { FiDollarSign, FiCheck, FiX, FiClock, FiDownload, FiCreditCard } from 'react-icons/fi';

const PAYOUT_REQUESTS = [
  { id: 'PO-2025-001', seller: 'Minh Long Shop', amount: '15.500.000 ₫', bank: 'Vietcombank - 998877***', date: '2025-12-14 08:30', status: 'pending' },
  { id: 'PO-2025-002', seller: 'An Nhiên Decor', amount: '2.300.000 ₫', bank: 'Techcombank - 112233***', date: '2025-12-14 09:15', status: 'pending' },
  { id: 'PO-2025-003', seller: 'Xưởng Gốm Việt', amount: '45.000.000 ₫', bank: 'MB Bank - 888899***', date: '2025-12-13 14:20', status: 'approved' },
  { id: 'PO-2025-004', seller: 'Tạp Hóa Mẹ Bỉm', amount: '500.000 ₫', bank: 'Momo - 0909***', date: '2025-12-13 10:00', status: 'rejected' },
];

export default function PayoutRequestsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Yêu cầu rút tiền</h1>
            <p className="text-sm text-gray-500 mt-1">Duyệt và xử lý các lệnh rút tiền từ người bán.</p>
         </div>
         <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
            <span className="text-gray-500 text-sm">Số dư quỹ sàn:</span>
            <span className="font-bold text-xl text-[#E78720]">2.450.000.000 ₫</span>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#E78720] to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-orange-100 text-xs font-medium uppercase mb-1">Cần xử lý ngay</p>
                    <h3 className="text-3xl font-bold">18</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <FiClock size={20} />
                </div>
            </div>
            <p className="text-xs mt-4 text-orange-100 flex items-center gap-1">
                <span className="bg-white/20 px-1.5 rounded">8 mới</span> trong hôm nay
            </p>
        </div>
        
        {/* Các thẻ thống kê phụ */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 text-xs uppercase font-bold">Đã thanh toán (Tháng 12)</p>
            <h3 className="text-2xl font-bold text-gray-800">450 Tr ₫</h3>
        </div>
         <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 text-xs uppercase font-bold">Đang chờ xử lý</p>
            <h3 className="text-2xl font-bold text-gray-800">85.2 Tr ₫</h3>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
             <p className="text-gray-500 text-xs uppercase font-bold">Bị từ chối</p>
            <h3 className="text-2xl font-bold text-gray-800">5</h3>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
         <div className="p-5 border-b border-gray-100 flex justify-between items-center">
             <h2 className="font-semibold text-gray-800">Danh sách yêu cầu</h2>
             <button className="text-sm text-[#E78720] font-medium hover:underline flex items-center gap-1">
                <FiDownload /> Xuất Excel
             </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Mã GD</th>
                        <th className="px-6 py-4">Người bán</th>
                        <th className="px-6 py-4">Thông tin nhận tiền</th>
                        <th className="px-6 py-4">Số tiền</th>
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {PAYOUT_REQUESTS.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-600">#{req.id}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800">{req.seller}</td>
                            <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                                <FiCreditCard className="text-gray-400" />
                                {req.bank}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#E78720]">{req.amount}</td>
                            <td className="px-6 py-4 text-gray-500">{req.date}</td>
                            <td className="px-6 py-4">
                                {req.status === 'pending' && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">Chờ duyệt</span>}
                                {req.status === 'approved' && <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Hoàn tất</span>}
                                {req.status === 'rejected' && <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">Từ chối</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {req.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:scale-110 transition-all" title="Duyệt">
                                            <FiCheck size={16} />
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all" title="Từ chối">
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}