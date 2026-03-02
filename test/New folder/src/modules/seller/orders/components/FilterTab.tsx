import React from 'react';
import classNames from 'classnames';

interface FilterTabProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const FilterTab: React.FC<FilterTabProps> = ({ label, isActive = false, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={classNames(
        "cursor-pointer text-lg whitespace-nowrap transition-colors duration-200 px-4 py-2",
        {
          "text-[#E78720] font-bold border-b-2 border-[#E78720]": isActive,
          "text-black font-light hover:text-[#E78720]": !isActive,
        },
        className
      )}
    >
      {label}
    </div>
  );
};

export default FilterTab;