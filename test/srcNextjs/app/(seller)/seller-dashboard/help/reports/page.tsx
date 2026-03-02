'use client';

import React, { useState } from 'react';
import { FiAlertCircle, FiClock, FiCheckCircle, FiFileText, FiUploadCloud } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { InputGroup } from '@/components/ui/InputGroup';

// Mock data cho lịch sử
const REPORT_HISTORY = [
  { id: 'RP-24010901', title: 'Đơn hàng #DH9928 bị hoàn trả sai lý do', date: '09/01/2026', status: 'pending', category: 'Vận chuyển' },
  { id: 'RP-23122505', title: 'Yêu cầu kiểm tra đối soát tháng 12', date: '25/12/2025', status: 'solved', category: 'Tài chính' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [category, setCategory] = useState('shipping');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Giải quyết khiếu nại & Báo cáo</h1>
        <p className="text-gray-500 text-sm mt-1">G-Mall cam kết xử lý các khiếu nại của Đối tác trong vòng 24h làm việc.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'create' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Gửi khiếu nại mới
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử khiếu nại
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'create' ? (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vấn đề liên quan đến</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['shipping', 'product', 'finance', 'system'].map((cat) => (
                      <div
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`cursor-pointer px-4 py-3 rounded-lg border text-sm text-center transition-all ${
                          category === cat
                            ? 'border-brand-orange bg-orange-50 text-brand-orange font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat === 'shipping' && 'Vận chuyển / Giao nhận'}
                        {cat === 'product' && 'Sản phẩm / Kiểm duyệt'}
                        {cat === 'finance' && 'Tài chính / Đối soát'}
                        {cat === 'system' && 'Lỗi hệ thống / Khác'}
                      </div>
                    ))}
                  </div>
                </div>

                <InputGroup label="Mã đơn hàng liên quan (Nếu có)" placeholder="Ví dụ: #DH123456" />
                
                <div className="space-y-1.5">
                   <label className="block text-sm font-medium text-gray-700">Tiêu đề khiếu nại</label>
                   <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Tóm tắt vấn đề của bạn" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="block text-sm font-medium text-gray-700">Nội dung chi tiết</label>
                   <textarea 
                      className="w-full h-40 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                      placeholder="Mô tả chi tiết vấn đề, thời gian xảy ra sự cố..."
                   ></textarea>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                    <FiUploadCloud size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-brand-orange">Tải lên hình ảnh/video bằng chứng</span>
                    <span className="text-xs mt-1">Hỗ trợ JPG, PNG, MP4 (Tối đa 10MB)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="ghost" type="button">Hủy bỏ</Button>
              <Button variant="primary" type="submit">Gửi khiếu nại</Button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-3 font-medium pl-2">Mã phiếu</th>
                  <th className="pb-3 font-medium">Tiêu đề</th>
                  <th className="pb-3 font-medium">Danh mục</th>
                  <th className="pb-3 font-medium">Ngày tạo</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium text-right pr-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {REPORT_HISTORY.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-2 font-medium text-gray-900">{item.id}</td>
                    <td className="py-4 text-gray-700">{item.title}</td>
                    <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.category}
                        </span>
                    </td>
                    <td className="py-4 text-gray-500">{item.date}</td>
                    <td className="py-4">
                      {item.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold">
                          <FiClock size={12} /> Đang xử lý
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">
                          <FiCheckCircle size={12} /> Đã giải quyết
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                        <Button variant="ghost" className="!px-3 !py-1.5 text-sm">Chi tiết</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}