'use client';

/**
 * wiki 0105 — trang Tiếp thị liên kết.
 *
 * TRƯỚC ĐÂY trang này chỉ có nội dung giới thiệu bạn bè (link `/register?ref=<userId>`),
 * trùng mục đích với `/user/invite` — khách nhận xét đúng là "hơi giống tính năng mời bạn
 * bè". Nội dung cũ được GIỮ NGUYÊN, chuyển thành tab "Giới thiệu bạn bè"; affiliate SẢN
 * PHẨM (chọn hàng của các shop, chia sẻ link từng sản phẩm, ăn hoa hồng tiền mặt) là tab
 * chính.
 *
 * Vì sao referral và affiliate không gộp làm một: referral gắn vào NGƯỜI
 * (`User.referredById`, quan hệ 1-1 vĩnh viễn, thưởng đúng một lần), affiliate gắn vào
 * GIAO DỊCH (link → click → dòng hàng → hoa hồng, lặp vô hạn). Hai mô hình dữ liệu khác
 * hẳn nhau nên là hai hệ chạy song song, chỉ dùng chung một trang.
 *
 * GĐ1 mới có hai tab. Các tab "Chọn sản phẩm" / "Link của tôi" / "Hoa hồng" /
 * "Ví & rút tiền" lên ở GĐ3–4.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AffiliateService, type AffiliateMe } from '@/services/AffiliateService';
import AffiliateRegisterTab from '@/modules/affiliate/components/AffiliateRegisterTab';
import ReferralTab from '@/modules/affiliate/components/ReferralTab';

type TabKey = 'product' | 'referral';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'product', label: 'Tiếp thị sản phẩm' },
  { key: 'referral', label: 'Giới thiệu bạn bè' },
];

export default function AffiliatePage() {
  const [tab, setTab] = useState<TabKey>('product');
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await AffiliateService.getMe();
        if (!cancelled && res) setMe(res);
      } catch (e) {
        // Không chặn trang: tab "Giới thiệu bạn bè" vẫn dùng được kể cả khi API này lỗi.
        console.error('[affiliate] không tải được hồ sơ tiếp thị:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegistered = useCallback((next: AffiliateMe) => setMe(next), []);

  return (
    <div className="p-6">
      <h1 className="mb-6 border-b border-gray-100 pb-4 text-xl font-bold text-gray-800">
        Tiếp thị liên kết
      </h1>

      <div className="mb-6 flex gap-1 border-b border-gray-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'product' &&
        (loading ? (
          <div className="text-sm text-gray-400">Đang tải…</div>
        ) : (
          <AffiliateRegisterTab me={me} onRegistered={handleRegistered} />
        ))}

      {tab === 'referral' && <ReferralTab />}
    </div>
  );
}
