'use client';
import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AffiliateLinksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Link Affiliate</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Tạo Link Mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Tìm theo tên link hoặc sản phẩm..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-primary-500"
          />
        </div>
        <select className="px-4 py-2 border rounded-lg text-sm bg-white">
           <option>Tất cả chiến dịch</option>
           <option>Giáng sinh</option>
        </select>
        <Button variant="outline" className="gap-2"><Filter size={16}/> Bộ lọc</Button>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3 w-10"><input type="checkbox" /></th>
              <th className="px-4 py-3">Tên Link / Chiến dịch</th>
              <th className="px-4 py-3">Sản phẩm đích</th>
              <th className="px-4 py-3 text-center">Click/Đơn</th>
              <th className="px-4 py-3 text-center">Tỷ lệ</th>
              <th className="px-4 py-3 text-right">Hoa hồng</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-4"><input type="checkbox" /></td>
              <td className="px-4 py-4">
                <div className="font-medium text-gray-800">Review Son Mac</div>
                <div className="text-xs text-gray-500">campaign: tiktok-review-1</div>
              </td>
              <td className="px-4 py-4 text-gray-600 truncate max-w-[150px]">
                <a href="#" className="hover:text-primary-600 flex items-center gap-1">
                  Son Mac Chili <ExternalLink size={12}/>
                </a>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="font-medium">1,204</div>
                <div className="text-xs text-gray-500">42 đơn</div>
              </td>
              <td className="px-4 py-4 text-center text-green-600 font-medium">3.5%</td>
              <td className="px-4 py-4 text-right font-bold text-gray-800">1.250.000₫</td>
              <td className="px-4 py-4 text-right">
                <button className="p-2 hover:bg-gray-100 rounded-full"><MoreHorizontal size={18}/></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Create Link Modal (Giản lược) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">Tạo Link Affiliate Mới</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Chọn sản phẩm / URL</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Dán link sản phẩm hoặc tìm kiếm..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Source (utm_source)</label>
                 <input className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" value="affiliate" readOnly />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Chiến dịch (utm_campaign)</label>
                 <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="vd: summer_sale" />
               </div>
            </div>
            
            <div className="pt-4 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button>Tạo Link Ngay</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}