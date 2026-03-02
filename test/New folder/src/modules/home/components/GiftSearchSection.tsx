import dynamic from "next/dynamic";
import React from "react";

const ChevronDown = dynamic(() => import("lucide-react").then((mod) => mod.ChevronDown), { ssr: false });
interface FilterItemProps {
  label: string;
  placeholder: string;
}

const SearchFilterItem = ({ label, placeholder }: FilterItemProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="font-sans text-[13px] text-black font-light ml-1">
      {label}
    </label>
    
    <div className="bg-white rounded-[30px] border border-[#CCCCCC] h-[40px] flex items-center px-3 justify-between cursor-pointer hover:border-brand-orange transition-colors group w-full">
      <span className="font-sans text-[14px] text-black font-light group-hover:text-brand-orange truncate">
        {placeholder}
      </span>
      <div className="opacity-60 flex-shrink-0 ml-2">
        {/* [SỬA LỖI] Sử dụng Component Icon từ thư viện */}
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </div>
    </div>
  </div>
);

const filterData = [
  { label: "Người nhận", placeholder: "Người nhận" },
  { label: "Ngày lễ", placeholder: "Ngày lễ" },
  { label: "Nhân dịp", placeholder: "Nhân dịp" },
  { label: "Sở thích", placeholder: "Sở thích" },
  { label: "Khoảng giá", placeholder: "Khoảng giá" },
  { label: "Người tặng", placeholder: "Người tặng" },
];

export const GiftSearchSection = () => {
  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 mt-8"> 
      <div className="bg-[#FFB0B8] rounded-[20px] w-full py-6 px-5 md:px-8 flex flex-col items-center shadow-sm">
        
        <h2 className="font-sans text-[20px] md:text-[26px] text-black font-light leading-tight mb-5 text-center uppercase">
          CHỌN MÓN QUÀ HOÀN HẢO
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 w-full">
          {filterData.map((item, idx) => (
            <SearchFilterItem
              key={idx}
              label={item.label}
              placeholder={item.placeholder}
            />
          ))}
        </div>

        <button className="mt-6 bg-brand-orange rounded-[30px] w-[200px] h-[40px] flex justify-center items-center hover:bg-brand-orange-dark transition-all shadow-md active:scale-95">
          <span className="font-sans text-[16px] text-white font-medium">
            Tìm kiếm ngay
          </span>
        </button>
      </div>
    </div>
  );
};