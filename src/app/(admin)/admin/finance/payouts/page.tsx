'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminService } from '@/services/AdminService';
import { PayoutRequest } from '@/types/admin';
import { formatCurrency } from '@/lib/utils';
import { FiCheck, FiX, FiInfo, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

type TabType = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // hooks-fix wiki 0031: useCallback for fetchPayouts so effect deps are stable
  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi API thực tế thông qua AdminService (đã cập nhật ở Phần 1)
      const res: any = await AdminService.getPayoutRequests({ status: activeTab });

      if (res && (res.data || Array.isArray(res))) {
          setPayouts(Array.isArray(res) ? res : res.data);
      } else {
          // Mock data fallback nếu API chưa chạy
          setPayouts(getMockPayouts(activeTab));
      }
    } catch (error) {
      console.error(error);
      setPayouts(getMockPayouts(activeTab)); // Fallback mock
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleApprove = async (id: string) => {
    if (!confirm('Xác nhận đã chuyển khoản cho Shop này? Hành động này không thể hoàn tác.')) return;
    
    try {
        await AdminService.approvePayout(id);
        toast.success('Đã duyệt yêu cầu rút tiền!');
        // Refresh list
        setPayouts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
        toast.error('Có lỗi xảy ra khi duyệt.');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
        await AdminService.rejectPayout(id, reason);
        toast.success('Đã từ chối yêu cầu.');
        setPayouts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
        toast.error('Lỗi khi từ chối.');
    }
  };

  // Helper Mock Data
  const getMockPayouts = (status: TabType): PayoutRequest[] => {
    const base = [
        { id: 'PO-101', shopId: 'S1', shopName: 'Tech Store Official', amount: 5000000, bankInfo: 'VCB - 1029384756 - NGUYEN VAN A', status: 'PENDING', requestedAt: '2024-05-20T08:00:00Z' },
        { id: 'PO-102', shopId: 'S2', shopName: 'Fashion Boutique', amount: 1200000, bankInfo: 'MB - 99998888 - LE THI B', status: 'PENDING', requestedAt: '2024-05-19T10:30:00Z' },
        { id: 'PO-103', shopId: 'S3', shopName: 'Gia Dụng Thông Minh', amount: 8000000, bankInfo: 'TPB - 111222333 - PHAM VAN C', status: 'APPROVED', requestedAt: '2024-05-18T09:00:00Z', processedAt: '2024-05-18T14:00:00Z' },
    ];
    return base.filter(item => item.status === status) as any;
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Yêu cầu rút tiền</h1>
       </div>

       {/* Tabs Navigation */}
       <div className="bg-white rounded-lg border-b border-gray-200 px-6 pt-4 flex gap-8">
          {[
            { id: 'PENDING', label: 'Yêu cầu mới' },
            { id: 'APPROVED', label: 'Đã thanh toán' },
            { id: 'REJECTED', label: 'Đã từ chối' }
          ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                {tab.label}
            </button>
          ))}
       </div>

       {/* Table List */}
       <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                    <th className="p-4">Mã YC</th>
                    <th className="p-4">Cửa hàng</th>
                    <th className="p-4">Thông tin ngân hàng</th>
                    <th className="p-4">Số tiền</th>
                    <th className="p-4">Ngày yêu cầu</th>
                    {activeTab === 'PENDING' && <th className="p-4 text-right">Hành động</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center">Đang tải dữ liệu...</td></tr>
                ) : payouts.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không có dữ liệu.</td></tr>
                ) : payouts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{item.id}</td>
                        <td className="p-4">
                            <div className="font-medium text-gray-800">{item.shopName}</div>
                            <div className="text-xs text-gray-500">Shop ID: {item.shopId}</div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-start gap-2">
                                <FiCreditCard className="mt-1 text-gray-400" />
                                <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {item.bankInfo}
                                </span>
                            </div>
                        </td>
                        <td className="p-4 font-bold text-blue-600">
                            {formatCurrency(item.amount)}
                        </td>
                        <td className="p-4 text-gray-500">
                            {new Date(item.requestedAt).toLocaleDateString('vi-VN')}
                            <div className="text-xs">{new Date(item.requestedAt).toLocaleTimeString('vi-VN')}</div>
                        </td>
                        
                        {activeTab === 'PENDING' && (
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleReject(item.id)}
                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Từ chối"
                                    >
                                        <FiX size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(item.id)}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <FiCheck size={18} />
                                        <span>Duyệt</span>
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}