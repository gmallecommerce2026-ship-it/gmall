'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VoucherService, Voucher } from '@/services/voucher.service';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import classNames from 'classnames';

export default function AdminVoucherPage() {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'ALL'>('SYSTEM');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'SYSTEM') {
        const data = await VoucherService.getSystemVouchers();
        setVouchers(data);
      } else {
        // Lấy toàn bộ voucher (có thể lọc scope=SHOP để xem riêng shop)
        const data = await VoucherService.getAllVouchers('SHOP'); 
        setVouchers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
          <p className="text-sm text-gray-500">Quản lý mã giảm giá sàn và theo dõi mã của Shop</p>
        </div>
        {/* Chỉ hiện nút tạo khi ở Tab System */}
        {activeTab === 'SYSTEM' && (
          <Link 
            href="/admin/marketing/vouchers/create" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus /> Tạo Voucher Sàn
          </Link>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={classNames("px-6 py-3 font-medium text-sm border-b-2 transition-colors", 
            activeTab === 'SYSTEM' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Voucher Sàn (Global)
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={classNames("px-6 py-3 font-medium text-sm border-b-2 transition-colors", 
            activeTab === 'ALL' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Voucher Shop (Toàn sàn)
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Mã Voucher</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Tên chương trình</th>
              {activeTab === 'ALL' && <th className="p-4 text-sm font-semibold text-gray-600">Shop</th>}
              <th className="p-4 text-sm font-semibold text-gray-600">Giảm giá</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Lượt dùng</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Thời gian</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chưa có voucher nào</td></tr>
            ) : vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                    {v.code}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-800">{v.name}</td>
                
                {activeTab === 'ALL' && (
                  <td className="p-4 text-sm text-gray-600">
                    {v.seller?.shopName || 'N/A'}
                  </td>
                )}

                <td className="p-4 text-sm">
                  {v.type === 'PERCENTAGE' ? (
                    <span className="text-orange-600 font-bold">{v.amount}%</span>
                  ) : (
                    <span className="text-green-600 font-bold">{v.amount.toLocaleString()}đ</span>
                  )}
                  {v.minOrderValue > 0 && <div className="text-xs text-gray-400 mt-1">Đơn từ {v.minOrderValue.toLocaleString()}đ</div>}
                </td>

                <td className="p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min((v.usageCount / v.usageLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{v.usageCount}/{v.usageLimit}</span>
                  </div>
                </td>

                <td className="p-4 text-xs text-gray-500">
                  <div>{new Date(v.startDate).toLocaleDateString()}</div>
                  <div>{new Date(v.endDate).toLocaleDateString()}</div>
                </td>
                
                <td className="p-4">
                  <span className={classNames("px-2 py-1 rounded-full text-xs font-medium", 
                    v.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {v.isActive ? 'Hoạt động' : 'Đã đóng'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}