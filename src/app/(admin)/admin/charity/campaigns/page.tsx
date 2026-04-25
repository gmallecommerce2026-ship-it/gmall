'use client';

/**
 * Spec [0018]: Multi-fund campaign CRUD admin page.
 *
 * Một campaign nhóm nhiều quỹ chạy song song trong khoảng thời gian. Tại
 * checkout, user chọn 1 quỹ trong campaign active để đóng góp 1% commission.
 *
 * Endpoints:
 *  - GET    /admin/charity/campaigns
 *  - POST   /admin/charity/campaigns          { name, description, banner, startDate, endDate, fundIds[] }
 *  - PATCH  /admin/charity/campaigns/:id
 *  - DELETE /admin/charity/campaigns/:id
 */

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/ApiClient';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Calendar, Image as ImageIcon, Save, X } from 'lucide-react';

interface Fund {
  id: string;
  name: string;
  status: string;
  isPrimary?: boolean;
}

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  funds?: { fund: Fund }[];
}

export default function CharityCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        apiClient.get('/admin/charity/campaigns?includeInactive=true'),
        apiClient.get('/admin/charity/funds'),
      ]);
      setCampaigns(Array.isArray(c) ? c : (c?.data || []));
      setFunds(Array.isArray(f) ? f : (f?.data || []));
    } catch (e: any) {
      toast.error('Không tải được dữ liệu campaign');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openCreate = () => { setEditing(null); setIsModalOpen(true); };
  const openEdit = (c: Campaign) => { setEditing(c); setIsModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá campaign này? Không ảnh hưởng lịch sử đóng góp.')) return;
    try {
      await apiClient.delete(`/admin/charity/campaigns/${id}`);
      toast.success('Đã xoá campaign');
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi xoá');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chiến dịch từ thiện (Campaign)</h1>
          <p className="text-sm text-gray-500 mt-1">Mỗi campaign gom nhiều quỹ, user checkout chọn 1 quỹ để đóng góp 1% phí hoa hồng.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-700 shadow-sm font-medium"
        >
          <Plus size={18} /> Tạo Campaign
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
          Chưa có campaign nào. Bấm "Tạo Campaign" để bắt đầu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {c.banner ? (
                <img src={c.banner} alt={c.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-300">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Active' : 'Tắt'}
                  </span>
                </div>
                {c.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(c.startDate).toLocaleDateString('vi-VN')} → {new Date(c.endDate).toLocaleDateString('vi-VN')}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(c.funds || []).map(f => (
                    <span key={f.fund.id} className="text-[11px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded">
                      {f.fund.name}
                    </span>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(c)} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-1">
                    <Edit2 size={14} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 text-sm border border-red-100 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1">
                    <Trash2 size={14} /> Xoá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CampaignModal
          initial={editing}
          funds={funds}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { setIsModalOpen(false); loadAll(); }}
        />
      )}
    </div>
  );
}

function CampaignModal({ initial, funds, onClose, onSaved }: { initial: Campaign | null; funds: Fund[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [banner, setBanner] = useState(initial?.banner || '');
  const [startDate, setStartDate] = useState(initial?.startDate ? initial.startDate.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(initial?.endDate ? initial.endDate.slice(0, 10) : '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>(
    (initial?.funds || []).map(f => f.fund.id)
  );
  const [saving, setSaving] = useState(false);

  const toggleFund = (id: string) => {
    setSelectedFundIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!name || !startDate || !endDate) {
      toast.error('Cần nhập tên, ngày bắt đầu, ngày kết thúc');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    setSaving(true);
    try {
      const payload = { name, description, banner, startDate, endDate, isActive, fundIds: selectedFundIds };
      if (initial) {
        await apiClient.patch(`/admin/charity/campaigns/${initial.id}`, payload);
        toast.success('Cập nhật thành công');
      } else {
        await apiClient.post('/admin/charity/campaigns', payload);
        toast.success('Tạo campaign thành công');
      }
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">{initial ? 'Chỉnh sửa Campaign' : 'Tạo Campaign Mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Tên campaign *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Đông ấm 2026" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Mô tả</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500 resize-none" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">URL banner</label>
            <input value={banner} onChange={e => setBanner(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Ngày bắt đầu *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Ngày kết thúc *</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-orange-500" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Quỹ trong campaign ({selectedFundIds.length} đã chọn)
            </label>
            {funds.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Chưa có quỹ nào. Tạo quỹ trước ở trang Quản lý quỹ.</p>
            ) : (
              <div className="space-y-1 max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg p-2">
                {funds.map(f => (
                  <label key={f.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFundIds.includes(f.id)}
                      onChange={() => toggleFund(f.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{f.name}</span>
                    {f.isPrimary && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Primary</span>}
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ml-auto ${f.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">Đang hoạt động (hiển thị tại checkout)</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Huỷ</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2">
            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
