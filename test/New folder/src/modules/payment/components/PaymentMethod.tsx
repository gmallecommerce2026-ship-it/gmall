"use client";

import React from 'react';
import Image from 'next/image';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export interface PaymentMethodType {
  id: string;
  name: string;
  icon: string;
}

// Dữ liệu PTTT chuẩn
export const PAYMENT_METHODS_DATA: PaymentMethodType[] = [
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '/assets-payment/ImageAsset6.png' },
  { id: 'momo', name: 'Thanh toán qua MoMo', icon: '/assets-payment/ImageAsset7.png' },
  { id: 'paypal', name: 'Thanh toán qua PayPal', icon: '/assets-payment/ImageAsset8.png' },
  { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '/assets-payment/ImageAsset9.png' },
];

interface PaymentMethodProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-be-vietnam-pro text-xl font-bold text-black mb-6">
        Phương thức thanh toán
      </h3>

      <RadioGroup value={selectedId} onChange={onSelect} className="space-y-3">
        <RadioGroup.Label className="sr-only">Phương thức thanh toán</RadioGroup.Label>
        {PAYMENT_METHODS_DATA.map((method) => (
          <RadioGroup.Option
            key={method.id}
            value={method.id}
            className={({ checked }) =>
              `relative flex cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                checked
                  ? 'border-brand-orange bg-orange-50 ring-1 ring-brand-orange'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`
            }
          >
            {({ checked }) => (
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-[60px] h-[34px] flex-shrink-0">
                    <Image
                      src={method.icon}
                      alt={method.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <RadioGroup.Label
                    as="span"
                    className={`font-be-vietnam-pro text-base ${
                      checked ? 'font-bold text-gray-900' : 'font-medium text-gray-600'
                    }`}
                  >
                    {method.name}
                  </RadioGroup.Label>
                </div>
                {checked ? (
                  <CheckCircleIcon className="h-6 w-6 text-brand-orange" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethod;