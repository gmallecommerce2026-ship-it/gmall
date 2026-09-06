'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminService } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils'; // Sử dụng utils có sẵn hoặc thay bằng hàm format Intl
import { FiDollarSign, FiTrendingUp, FiClock, FiSearch, FiFileText, FiCreditCard } from 'react-icons/fi';

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
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      try {
        setLoading(true);
        const res: any = await AdminService.getRevenueStats('year');

        if (res) {
          setStats({
            totalRevenue: Number(res.totalRevenue) || 0,
            platformFee: Number(res.platformFee) || 0,
            pendingPayout: Number(res.pendingPayout) || 0
          });
          setChartData(Array.isArray(res.chartData) ? res.chartData : []);
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
             {/* wiki 0108: ĐÃ BỎ huy hiệu "+15.3% (Demo)". Đó là con số bịa cứng trong mã,
                 nằm ngay cạnh doanh thu THẬT trên màn hình quản trị — người đọc không có
                 cách nào biết một con số là thật còn con số kia là giả. Chưa có dữ liệu
                 tăng trưởng theo kỳ thì thà không hiện gì. Khi nào BE trả % tăng trưởng
                 thật thì dựng lại huy hiệu này. */}
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
             {/* wiki 0108: trước ghi "5-8%" — cũng là số bịa. Phí sàn thật là MỘT mức phẳng,
                 đọc từ `ORDER_PLATFORM_FEE_RATE` (mặc định 0.05) trong `order.service`, và
                 `finance.service` tính lợi nhuận bằng đúng 0.05. Đã kiểm chứng đầu-cuối
                 trên prod: ví người bán được cộng đúng 95% giá trị đơn. */}
             <p className="text-sm text-gray-400 mt-4">Phí giao dịch: 5% giá trị đơn hàng</p>
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
             {/* wiki 0108: trước đây là `<button>` không có `onClick` — bấm vào không đi đâu.
                 Màn duyệt rút tiền `/admin/finance/payouts` đã tồn tại và gọi API thật
                 (getPayoutRequests / approvePayout / rejectPayout), chỉ là không có đường
                 dẫn nào tới. Nay là Link thật. */}
             <Link
                href="/admin/finance/payouts"
                className="inline-block text-sm text-[#E78720] font-medium mt-4 hover:underline"
             >
                Xem yêu cầu rút tiền &rarr;
             </Link>
          </div>
       </div>

       {/* #60: biểu đồ doanh thu 12 tháng — SVG inline, không phụ thuộc lib. */}
       <RevenueChart data={chartData} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// RevenueChart — bar chart đơn giản dựng bằng SVG (#60).
// Không dùng recharts/d3 → tránh thêm ~80KB bundle. Đủ cho 12 cột.
// ──────────────────────────────────────────────────────────────────────

const RevenueChart: React.FC<{ data: { date: string; value: number }[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chưa có dữ liệu doanh thu để vẽ biểu đồ.</p>
      </div>
    );
  }

  const W = 800;
  const H = 320;
  const PAD_LEFT = 64;
  const PAD_BOTTOM = 36;
  const PAD_TOP = 16;
  const PAD_RIGHT = 16;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const max = Math.max(...data.map((d) => d.value), 1); // tránh chia 0
  const barGap = 8;
  const barW = innerW / data.length - barGap;

  const formatShort = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return String(n);
  };

  // 4 horizontal grid lines tại 0/25/50/75/100% max
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => {
    const y = PAD_TOP + innerH * (1 - p);
    return { y, label: formatShort(max * p) };
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Doanh thu 12 tháng gần nhất</h3>
        <span className="text-xs text-gray-500">đơn vị: VND</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Biểu đồ doanh thu 12 tháng">
        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={g.y} y2={g.y} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x={PAD_LEFT - 8} y={g.y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {g.label}
            </text>
          </g>
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const x = PAD_LEFT + i * (barW + barGap);
          const h = (d.value / max) * innerH;
          const y = PAD_TOP + innerH - h;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                fill="url(#barGradient)"
                rx={3}
              >
                <title>{`${d.date}: ${d.value.toLocaleString('vi-VN')} đ`}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={H - PAD_BOTTOM + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {d.date.slice(5)}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};