'use client';

/**
 * wiki 0105 — trang Tiếp thị liên kết.
 *
 * TRƯỚC ĐÂY trang này chỉ có nội dung giới thiệu bạn bè (link `/register?ref=<userId>`),
 * trùng mục đích với `/user/invite` — khách nhận xét đúng là "hơi giống tính năng mời bạn
 * bè". Nội dung cũ được GIỮ NGUYÊN, chuyển thành tab "Giới thiệu bạn bè"; affiliate SẢN
 * PHẨM (chọn hàng của các shop, chia sẻ link từng sản phẩm, ăn hoa hồng tiền mặt) là
 * phần chính.
 *
 * Vì sao referral và affiliate không gộp làm một: referral gắn vào NGƯỜI
 * (`User.referredById`, quan hệ 1-1 vĩnh viễn, thưởng đúng một lần), affiliate gắn vào
 * GIAO DỊCH (link → click → dòng hàng → hoa hồng, lặp vô hạn). Hai mô hình dữ liệu khác
 * hẳn nhau nên là hai hệ chạy song song, chỉ dùng chung một trang.
 *
 * Tab hiển thị theo TRẠNG THÁI hồ sơ: chưa được duyệt thì chỉ thấy tab đăng ký — bày ra
 * "Chọn sản phẩm" rồi chặn ở nút "Lấy link" là cách chắc chắn làm người dùng bực.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AffiliateService, type AffiliateMe } from '@/services/AffiliateService';
import AffiliateRegisterTab from '@/modules/affiliate/components/AffiliateRegisterTab';
import AffiliateProductsTab from '@/modules/affiliate/components/AffiliateProductsTab';
import AffiliateLinksTab from '@/modules/affiliate/components/AffiliateLinksTab';
import AffiliateEarningsTab from '@/modules/affiliate/components/AffiliateEarningsTab';
import ReferralTab from '@/modules/affiliate/components/ReferralTab';

type TabKey = 'register' | 'products' | 'links' | 'earnings' | 'referral';

export default function AffiliatePage() {
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('register');

  const approved = me?.status === 'APPROVED';

  const tabs = useMemo(() => {
    const base: { key: TabKey; label: string }[] = approved
      ? [
          { key: 'products', label: 'Chọn sản phẩm' },
          { key: 'links', label: 'Link của tôi' },
          { key: 'earnings', label: 'Hoa hồng & Ví' },
          { key: 'register', label: 'Hồ sơ' },
        ]
      : [{ key: 'register', label: 'Tiếp thị sản phẩm' }];
    return [...base, { key: 'referral' as TabKey, label: 'Giới thiệu bạn bè' }];
  }, [approved]);

  const load = useCallback(async () => {
    try {
      const res = await AffiliateService.getMe();
      if (res) {
        setMe(res);
        // Đã được duyệt thì mở thẳng tab chọn sản phẩm — đó là việc họ vào đây để làm.
        if (res.status === 'APPROVED') setTab((t) => (t === 'register' ? 'products' : t));
      }
    } catch (e) {
      // Không chặn trang: tab "Giới thiệu bạn bè" vẫn dùng được kể cả khi API này lỗi.
      console.error('[affiliate] không tải được hồ sơ tiếp thị:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRegistered = useCallback((next: AffiliateMe) => setMe(next), []);

  return (
    <div className="p-6">
      <h1 className="mb-6 border-b border-gray-100 pb-4 text-xl font-bold text-gray-800">
        Tiếp thị liên kết
      </h1>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200" role="tablist">
        {tabs.map((t) => (
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

      {loading && tab !== 'referral' ? (
        <div className="text-sm text-gray-400">Đang tải…</div>
      ) : (
        <>
          {tab === 'register' && (
            <AffiliateRegisterTab me={me} onRegistered={handleRegistered} />
          )}
          {tab === 'products' && <AffiliateProductsTab />}
          {tab === 'links' && <AffiliateLinksTab />}
          {tab === 'earnings' && <AffiliateEarningsTab balance={me?.balance} />}
          {tab === 'referral' && <ReferralTab />}
        </>
      )}
    </div>
  );
}
