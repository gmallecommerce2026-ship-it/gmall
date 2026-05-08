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
 */

const RECIPIENTS = [
  { value: '', label: 'Người nhận' },
  { value: 'người yêu', label: 'Người yêu' },
  { value: 'mẹ', label: 'Mẹ' },
  { value: 'bố', label: 'Bố' },
  { value: 'bạn bè', label: 'Bạn bè' },
  { value: 'đồng nghiệp', label: 'Đồng nghiệp' },
  { value: 'sếp', label: 'Sếp' },
  { value: 'trẻ em', label: 'Trẻ em' },
];

const HOLIDAYS = [
  { value: '', label: 'Ngày lễ' },
  { value: 'valentine', label: 'Valentine 14/2' },
  { value: '8/3', label: '8/3' },
  { value: '20/10', label: '20/10' },
  { value: '20/11', label: '20/11' },
  { value: 'noel', label: 'Giáng sinh' },
  { value: 'tết', label: 'Tết' },
];

const OCCASIONS = [
  { value: '', label: 'Nhân dịp' },
  { value: 'sinh nhật', label: 'Sinh nhật' },
  { value: 'kỷ niệm', label: 'Kỷ niệm' },
  { value: 'tốt nghiệp', label: 'Tốt nghiệp' },
  { value: 'tân gia', label: 'Tân gia' },
  { value: 'thăng chức', label: 'Thăng chức' },
];

const INTERESTS = [
  { value: '', label: 'Sở thích' },
  { value: 'mỹ phẩm', label: 'Mỹ phẩm' },
  { value: 'thời trang', label: 'Thời trang' },
  { value: 'công nghệ', label: 'Công nghệ' },
  { value: 'sách', label: 'Sách' },
  { value: 'handmade', label: 'Handmade' },
  { value: 'ẩm thực', label: 'Ẩm thực' },
];

const PRICE_RANGES = [
  { value: '', label: 'Khoảng giá' },
  { value: '0-200000', label: 'Dưới 200k' },
  { value: '200000-500000', label: '200k - 500k' },
  { value: '500000-1000000', label: '500k - 1tr' },
  { value: '1000000-3000000', label: '1tr - 3tr' },
  { value: '3000000-', label: 'Trên 3tr' },
];

const GIVERS = [
  { value: '', label: 'Người tặng' },
  { value: 'cá nhân', label: 'Cá nhân' },
  { value: 'doanh nghiệp', label: 'Doanh nghiệp' },
  { value: 'nhóm', label: 'Nhóm bạn' },
];

interface SelectFieldProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ options, value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-white border border-pink-200 text-gray-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none cursor-pointer"
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
  const [holiday, setHoliday] = useState('');
  const [occasion, setOccasion] = useState('');
  const [interest, setInterest] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [giver, setGiver] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = [recipient, holiday, occasion, interest, giver].filter(Boolean);
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Người nhận</label>
            <SelectField options={RECIPIENTS} value={recipient} onChange={setRecipient} />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Ngày lễ</label>
            <SelectField options={HOLIDAYS} value={holiday} onChange={setHoliday} />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Nhân dịp</label>
            <SelectField options={OCCASIONS} value={occasion} onChange={setOccasion} />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Sở thích</label>
            <SelectField options={INTERESTS} value={interest} onChange={setInterest} />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Khoảng giá</label>
            <SelectField options={PRICE_RANGES} value={priceRange} onChange={setPriceRange} />
          </div>
          <div>
            <label className="block text-[11px] text-pink-700 mb-1 font-medium">Người tặng</label>
            <SelectField options={GIVERS} value={giver} onChange={setGiver} />
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-full shadow hover:shadow-md hover:from-pink-600 hover:to-orange-500 transition-all text-sm"
          >
            Tìm kiếm ngay
          </button>
        </div>
      </form>
    </div>
  );
};

export default GiftFinderFilter;
