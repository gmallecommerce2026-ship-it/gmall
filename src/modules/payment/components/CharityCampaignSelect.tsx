'use client';

/**
 * Spec [0018]: Multi-fund campaign — user chọn quỹ tại checkout.
 *
 * Lấy /charity/campaigns/active. Mỗi campaign có nhiều quỹ. User chọn 1 quỹ
 * (radio); nếu không chọn -> BE auto đẩy 1% commission vào quỹ primary.
 *
 * Lưu ý: BE Order schema chưa persist charityCampaignFundId (chờ migrate),
 * nên hiện tại lựa chọn này được gửi lên payload nhưng BE chỉ log; auto-trích
 * vẫn vào primary fund. Khi có migrate, swap-in route persist.
 */

import React, { useEffect, useState } from 'react';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '@/lib/api/ApiClient';

interface Fund {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  banner?: string;
  startDate: string;
  endDate: string;
  funds: { fund: Fund }[];
}

interface CharityCampaignSelectProps {
  selectedFundId: string | null;
  onSelect: (fundId: string | null) => void;
}

const CharityCampaignSelect: React.FC<CharityCampaignSelectProps> = ({ selectedFundId, onSelect }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res: any = await apiClient.get('/charity/campaigns/active');
        const data = Array.isArray(res) ? res : (res?.data || []);
        if (!cancelled) setCampaigns(data);
      } catch (e) {
        console.error('[CharityCampaignSelect] fetch fail:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Không có campaign active -> ẩn block luôn (UI sạch).
  if (!loading && campaigns.length === 0) return null;

  const allFunds = campaigns.flatMap(c => c.funds.map(f => ({ ...f.fund, _campaign: c })));
  const selectedFundName = allFunds.find(f => f.id === selectedFundId)?.name;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-pink-500" />
          <h3 className="font-bold text-gray-800">Đóng góp 1% phí hoa hồng</h3>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          {expanded ? <>Thu gọn <ChevronUp size={14} /></> : <>Chi tiết <ChevronDown size={14} /></>}
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        Mỗi đơn hoàn tất, GMall trích <strong className="text-pink-600">1% phí hoa hồng</strong> vào quỹ từ thiện.
        {selectedFundName ? (
          <> Bạn đã chọn quỹ: <strong className="text-gray-700">{selectedFundName}</strong>.</>
        ) : (
          <> Không chọn — sẽ vào quỹ chung mặc định.</>
        )}
      </p>

      {loading ? (
        <div className="text-center py-3 text-xs text-gray-400">Đang tải...</div>
      ) : expanded ? (
        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {/* Mặc định */}
          <label className={`block border rounded-lg p-3 cursor-pointer transition-all ${selectedFundId === null ? 'border-pink-400 bg-pink-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="charity-fund"
                checked={selectedFundId === null}
                onChange={() => onSelect(null)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">Quỹ chung mặc định</div>
                <div className="text-xs text-gray-500 mt-0.5">Để GMall phân bổ vào quỹ ưu tiên hiện tại.</div>
              </div>
            </div>
          </label>

          {/* Campaigns */}
          {campaigns.map(c => (
            <div key={c.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 px-3 py-2 flex items-center gap-2">
                <span className="text-xs font-bold text-pink-600 uppercase">{c.name}</span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  Đến {new Date(c.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="p-2 space-y-2">
                {c.funds.map(({ fund }) => (
                  <label
                    key={fund.id}
                    className={`block border rounded p-2 cursor-pointer transition-all ${selectedFundId === fund.id ? 'border-pink-400 bg-pink-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="charity-fund"
                        checked={selectedFundId === fund.id}
                        onChange={() => onSelect(fund.id)}
                        className="mt-0.5"
                      />
                      {fund.image && <img src={fund.image} alt={fund.name} className="w-10 h-10 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{fund.name}</div>
                        {fund.description && <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{fund.description}</div>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-xs text-pink-600 hover:text-pink-700 underline text-left"
        >
          Bấm để chọn quỹ cụ thể ({campaigns.length} chiến dịch đang chạy)
        </button>
      )}
    </div>
  );
};

export default CharityCampaignSelect;
