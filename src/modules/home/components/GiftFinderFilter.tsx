"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

/**
 * #25 — "CHỌN MÓN QUÀ HOÀN HẢO" filter dưới hero banner.
 *
 * Khi submit, gom các giá trị thành query string `/search?q=<tag>&...` —
 * ưu tiên `q` nếu user đã chọn nhiều criteria, nối bằng dấu cách. Backend
 * search dùng full-text match (xem product-read.service.ts), nên tag-style
 * keyword ổn để khớp tag tương ứng trong DB.
 *
 * Các option là static — sau này có thể fetch từ /content/config/gift-criteria
 * khi marketing muốn đổi.
 *
 * ---------------------------------------------------------------------------
 * wiki 0095 B1 — Khách chốt lại bộ lọc (bảng "Trường hiện tại / Quyết định"):
 *
 *   Người nhận    → giữ, đổi nhãn "Bạn muốn tặng ai?"
 *   Ngày lễ       → gộp vào "Dịp tặng"
 *   Nhân dịp      → gộp vào "Dịp tặng"
 *   Sở thích      → đổi nhãn "Sở thích hoặc nhu cầu"
 *   Khoảng giá    → đổi nhãn "Ngân sách mỗi món"
 *   Người tặng    → bỏ khỏi bộ lọc chính
 *   Tìm kiếm ngay → đổi nhãn "Xem gợi ý quà"
 *
 * 6 ô còn 4 ô. Hai nhóm "Ngày lễ" và "Nhân dịp" gộp thành MỘT select duy nhất
 * nhưng vẫn tách <optgroup> — giữ nguyên toàn bộ lựa chọn cũ (không mất
 * Valentine/8-3/sinh nhật...), chỉ bớt một ô phải điền. Cách khác là trộn phẳng
 * thành 1 danh sách 11 dòng, nhưng lẫn "Tết" với "Thăng chức" thì khó quét mắt.
 */

const RECIPIENTS = [
  { value: '', label: 'Bạn muốn tặng ai?' },
  { value: 'người yêu', label: 'Người yêu' },
  { value: 'mẹ', label: 'Mẹ' },
  { value: 'bố', label: 'Bố' },
  { value: 'bạn bè', label: 'Bạn bè' },
  { value: 'đồng nghiệp', label: 'Đồng nghiệp' },
  { value: 'sếp', label: 'Sếp' },
  { value: 'trẻ em', label: 'Trẻ em' },
];

/** Gộp "Ngày lễ" + "Nhân dịp" → "Dịp tặng", giữ 2 optgroup cho dễ nhìn. */
const OCCASION_GROUPS = [
  {
    label: 'Ngày lễ',
    options: [
      { value: 'valentine', label: 'Valentine 14/2' },
      { value: '8/3', label: '8/3' },
      { value: '20/10', label: '20/10' },
      { value: '20/11', label: '20/11' },
      { value: 'noel', label: 'Giáng sinh' },
      { value: 'tết', label: 'Tết' },
    ],
  },
  {
    label: 'Dịp cá nhân',
    options: [
      { value: 'sinh nhật', label: 'Sinh nhật' },
      { value: 'kỷ niệm', label: 'Kỷ niệm' },
      { value: 'tốt nghiệp', label: 'Tốt nghiệp' },
      { value: 'tân gia', label: 'Tân gia' },
      { value: 'thăng chức', label: 'Thăng chức' },
    ],
  },
];

const INTERESTS = [
  { value: '', label: 'Sở thích hoặc nhu cầu' },
  { value: 'mỹ phẩm', label: 'Mỹ phẩm' },
  { value: 'thời trang', label: 'Thời trang' },
  { value: 'công nghệ', label: 'Công nghệ' },
  { value: 'sách', label: 'Sách' },
  { value: 'handmade', label: 'Handmade' },
  { value: 'ẩm thực', label: 'Ẩm thực' },
];

const PRICE_RANGES = [
  { value: '', label: 'Ngân sách mỗi món' },
  { value: '0-200000', label: 'Dưới 200k' },
  { value: '200000-500000', label: '200k - 500k' },
  { value: '500000-1000000', label: '500k - 1tr' },
  { value: '1000000-3000000', label: '1tr - 3tr' },
  { value: '3000000-', label: 'Trên 3tr' },
];

const SELECT_CLASS =
  "w-full bg-white border border-pink-200 text-gray-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none cursor-pointer";

interface SelectFieldProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ options, value, onChange, ariaLabel }) => (
  <select
    aria-label={ariaLabel}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={SELECT_CLASS}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const GiftFinderFilter: React.FC = () => {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');
  const [interest, setInterest] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = [recipient, occasion, interest].filter(Boolean);
    const params = new URLSearchParams();
    if (tokens.length > 0) params.set('q', tokens.join(' '));
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
    }
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  };

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-6">
      <form
        onSubmit={handleSubmit}
        className="bg-pink-50 border border-pink-100 rounded-xl p-5 md:p-6 shadow-sm"
      >
        <h2 className="text-center text-base md:text-lg font-bold text-pink-700 uppercase tracking-wide mb-4 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" /> Chọn món quà hoàn hảo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Bạn muốn tặng ai?</label>
            <SelectField
              options={RECIPIENTS}
              value={recipient}
              onChange={setRecipient}
              ariaLabel="Bạn muốn tặng ai?"
            />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Dịp tặng</label>
            <select
              aria-label="Dịp tặng"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Dịp tặng</option>
              {OCCASION_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Sở thích hoặc nhu cầu</label>
            <SelectField
              options={INTERESTS}
              value={interest}
              onChange={setInterest}
              ariaLabel="Sở thích hoặc nhu cầu"
            />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Ngân sách mỗi món</label>
            <SelectField
              options={PRICE_RANGES}
              value={priceRange}
              onChange={setPriceRange}
              ariaLabel="Ngân sách mỗi món"
            />
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-full shadow hover:shadow-md hover:from-pink-600 hover:to-orange-500 transition-all text-sm"
          >
            Xem gợi ý quà
          </button>
        </div>
      </form>
    </div>
  );
};

export default GiftFinderFilter;
