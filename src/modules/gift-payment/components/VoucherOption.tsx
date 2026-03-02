import React from 'react';

interface VoucherOptionProps {
  text: string;
  isLarge?: boolean;
  isMediumWeight?: boolean;
  minWidth: string;
  marginTop?: string;
}

const VoucherOption: React.FC<VoucherOptionProps> = ({
  text,
  isLarge,
  isMediumWeight,
  minWidth,
  marginTop,
}) => (
  <div
    style={{ minWidth, marginTop }}
    className={`
      font-['Be_Vietnam_Pro'] whitespace-nowrap text-black leading-none
      ${isLarge ? 'text-[20px]' : 'text-[16px]'}
      ${isMediumWeight ? 'font-medium' : 'font-thin'}
    `}
  >
    {text}
  </div>
);

export default VoucherOption;