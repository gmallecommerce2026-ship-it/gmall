'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

const LINKED_CARDS = [
  {
    id: 1,
    type: 'Visa',
    last4: '4242',
    holder: 'NGUYEN VAN A',
    expiry: '12/25',
    bank: 'Vietcombank',
    isDefault: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' // Bạn có thể thay bằng icon local
  },
  {
    id: 2,
    type: 'Mastercard',
    last4: '8888',
    holder: 'NGUYEN VAN A',
    expiry: '09/24',
    bank: 'Techcombank',
    isDefault: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'
  }
];

export default function PaymentPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Ngân hàng / Thẻ tín dụng</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý phương thức thanh toán của bạn</p>
        </div>
        <Button className="!px-4 !py-2.5 flex items-center gap-2 text-sm">
            <Plus size={16} /> Thêm thẻ mới
        </Button>
      </div>

      <div className="space-y-6">
        {/* Credit/Debit Cards */}
        <div>
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-brand-orange" /> Thẻ Tín dụng / Ghi nợ
            </h2>
            
            <div className="space-y-4">
                {LINKED_CARDS.map((card) => (
                    <div key={card.id} className="group relative border border-gray-200 rounded-xl p-4 md:p-6 hover:border-brand-orange/50 hover:shadow-md transition-all bg-white">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-9 bg-gray-50 rounded border border-gray-100 flex items-center justify-center p-1">
                                    <img src={card.logo} alt={card.type} className="max-w-full max-h-full" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-800 text-lg">
                                            {card.bank} <span className="text-gray-400 font-normal text-sm">({card.type})</span>
                                        </p>
                                        {card.isDefault && (
                                            <span className="bg-orange-50 text-brand-orange text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Mặc định</span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-mono mt-1">**** **** **** {card.last4}</p>
                                    <p className="text-xs text-gray-400 mt-2">Hết hạn: {card.expiry}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button className="text-sm text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Bank Accounts (Example empty state or list) */}
        <div className="pt-6 border-t border-gray-100">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-blue-600 font-bold">$</span> Tài khoản ngân hàng
                </h2>
                <button className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
                    <Plus size={14} /> Liên kết tài khoản
                </button>
             </div>
             
             {/* Empty State Example */}
             <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
                <p className="text-sm text-gray-500 mb-2">Bạn chưa liên kết tài khoản ngân hàng nào.</p>
                <p className="text-xs text-gray-400">Liên kết tài khoản ngân hàng để nhận tiền hoàn và thanh toán nhanh chóng.</p>
             </div>
        </div>
      </div>
    </div>
  );
}