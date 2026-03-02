'use client';

import React, { useEffect, useState } from 'react';
import { AdminService } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils'; // Sử dụng utils có sẵn hoặc thay bằng hàm format Intl
import { FiDollarSign, FiTrendingUp, FiClock, FiSearch, FiFileText, FiArrowUpRight, FiCreditCard } from 'react-icons/fi';

// --- Types Mock cho giao diện này ---
interface Transaction {
  id: string;
  type: 'ORDER_FEE' | 'WITHDRAWAL' | 'REFUND';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  relatedId?: string; // Order ID hoặc Shop ID
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformFee: 0,
    pendingPayout: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      try {
        setLoading(true);
        const res: any = await AdminService.getRevenueStats('year');
        
        // KIỂM TRA DỮ LIỆU TRẢ VỀ TRƯỚC KHI SET STATE
        if (res) {
          setStats({
            totalRevenue: Number(res.totalRevenue) || 0,
            platformFee: Number(res.platformFee) || 0,
            pendingPayout: Number(res.pendingPayout) || 0
          });
        }
      } catch (error) {
        console.error("Lỗi tải doanh thu:", error);
      } finally {
        setLoading(false);
      }
    };

  const renderBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Thành công</span>;
      case 'PENDING': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">Đang xử lý</span>;
      default: return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Thất bại</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu tài chính...</div>;
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu sàn</h1>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Doanh thu GMV */}
          <div className="bg-gradient-to-br from-[#E78720] to-[#FFB05C] rounded-lg p-6 text-white shadow-lg">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-orange-100 font-medium mb-1">Tổng doanh thu (GMV)</p>
                   {/* Dùng biến stats an toàn */}
                   <h2 className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-lg"><FiDollarSign size={24}/></div>
             </div>
             <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                <FiArrowUpRight/> +15.3% (Demo)
             </div>
          </div>

          {/* Card 2: Lợi nhuận sàn */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-gray-500 font-medium mb-1">Lợi nhuận ròng (Phí sàn)</p>
                   <h2 className="text-3xl font-bold text-gray-800">{formatCurrency(stats.platformFee)}</h2>
                </div>
                <div className="bg-green-100 text-green-600 p-2 rounded-lg"><FiCreditCard size={24}/></div>
             </div>
             <p className="text-sm text-gray-400 mt-4">Phí giao dịch trung bình: 5-8%</p>
          </div>

          {/* Card 3: Payout */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-gray-500 font-medium mb-1">Chờ thanh toán (Payout)</p>
                   <h2 className="text-3xl font-bold text-gray-800">{formatCurrency(stats.pendingPayout)}</h2>
                </div>
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FiDollarSign size={24}/></div>
             </div>
             <button className="text-sm text-[#E78720] font-medium mt-4 hover:underline">
                Xem yêu cầu rút tiền &rarr;
             </button>
          </div>
       </div>

       {/* Placeholder Chart */}
       <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-[400px] flex items-center justify-center">
          <p className="text-gray-400">Biểu đồ đang cập nhật...</p>
       </div>
    </div>
  );
}