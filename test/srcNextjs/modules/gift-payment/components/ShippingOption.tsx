import React from 'react';

interface ShippingOptionProps {
  text: string;
  isHeader?: boolean;
  minWidth: string;
}

const ShippingOption: React.FC<ShippingOptionProps> = ({
  text,
  isHeader,
  minWidth,
}) => (
  <div
    style={{ minWidth }}
    className={`
      font-['Be_Vietnam_Pro'] whitespace-nowrap leading-none font-light
      ${isHeader ? 'text-[15px] text-black' : 'text-[13px] text-neutral-500'}
    `}
  >
    {text}
  </div>
);

export default ShippingOption;