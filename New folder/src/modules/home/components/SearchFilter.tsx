import React from "react";

// Đã refactor để dùng props rõ ràng và Tailwind
const SearchFilter = ({
  label,
  value,
  iconSrc,
  iconAlt,
}: {
  label: string;
  value: string;
  iconSrc: string;
  iconAlt: string;
}) => (
  <div className="flex flex-col justify-between items-start gap-4 w-[304.5px]">
    <div className="font-sans text-[15px] whitespace-nowrap text-white leading-[18px] font-light px-1">
      {label}
    </div>
    <div className="bg-white rounded-[10px] border border-[rgb(204,204,204)] w-full h-[47px] flex flex-row justify-between items-center px-4 py-2">
      <div className="font-sans text-[15px] text-black leading-[18px] font-light">
        {value}
      </div>
      <div className="flex justify-center items-center">
        <img width="13.4px" height="7.8px" src={iconSrc} alt={iconAlt} />
      </div>
    </div>
  </div>
);

export default SearchFilter;