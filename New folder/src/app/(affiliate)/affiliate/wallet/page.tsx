import React from 'react';
import Button from '@/components/ui/Button';
import { ArrowUpRight, Heart, HeartHandshake } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ví Affiliate</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-primary-100 text-sm font-medium mb-1">Số dư khả dụng</p>
          <h2 className="text-4xl font-bold mb-6">4.500.000₫</h2>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="">
               <p className="text-xs text-primary-200">Đang chờ duyệt</p>
               <p className="font-semibold">1.200.000₫</p>
             </div>
             <div className="">
               <p className="text-xs text-primary-200">Đã rút tổng cộng</p>
               <p className="font-semibold">15.000.000₫</p>
             </div>
          </div>
          
          <div className="mt-6 flex gap-3">
             <button className="flex-1 bg-white text-primary-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <ArrowUpRight size={16}/> Rút tiền
             </button>
             <button className="flex-1 bg-primary-700/50 text-white py-2 rounded-lg font-semibold text-sm hover:bg-primary-700/70 border border-white/20 flex items-center justify-center gap-2">
                <HeartHandshake size={16}/> Quyên góp
             </button>
          </div>
        </div>

        {/* Banking Info (Simplified) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Tài khoản nhận tiền</h3>
              <Button variant="outline">Chỉnh sửa</Button>
           </div>
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">VCB</div>
              <div>
                 <p className="font-bold text-gray-800">Vietcombank</p>
                 <p className="text-sm text-gray-500">**** **** **** 9988</p>
                 <p className="text-xs text-gray-400">NGUYEN VAN A</p>
              </div>
           </div>
           
           <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Cấu hình tự động trích quỹ</h4>
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-4 h-4 text-primary-600" checked readOnly/>
                 <span className="text-sm text-gray-600">Tự động trích <span className="font-bold">10%</span> hoa hồng vào quỹ từ thiện.</span>
              </div>
           </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
           <h3 className="font-bold text-gray-800">Lịch sử giao dịch</h3>
        </div>
        <table className="w-full text-sm text-left">
           <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                 <th className="px-6 py-3">Mã GD</th>
                 <th className="px-6 py-3">Thời gian</th>
                 <th className="px-6 py-3">Loại</th>
                 <th className="px-6 py-3">Số tiền</th>
                 <th className="px-6 py-3">Trạng thái</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              <tr>
                 <td className="px-6 py-4 font-mono text-xs text-gray-500">#TRX-001</td>
                 <td className="px-6 py-4">20/12/2025</td>
                 <td className="px-6 py-4">Rút tiền về NH</td>
                 <td className="px-6 py-4 font-medium text-red-600">- 2.000.000₫</td>
                 <td className="px-6 py-4 text-green-600">Hoàn thành</td>
              </tr>
              <tr>
                 <td className="px-6 py-4 font-mono text-xs text-gray-500">#TRX-002</td>
                 <td className="px-6 py-4">15/12/2025</td>
                 <td className="px-6 py-4 flex items-center gap-2">
                    <Heart size={14} className="text-red-500"/> Quyên góp từ thiện
                 </td>
                 <td className="px-6 py-4 font-medium text-red-600">- 500.000₫</td>
                 <td className="px-6 py-4 text-green-600">Hoàn thành</td>
              </tr>
           </tbody>
        </table>
      </div>
    </div>
  );
}