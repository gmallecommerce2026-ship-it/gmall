import React from 'react';

interface PaymentSummaryRowProps {
  label: string;
  value: string;
  width: string;
  isSlightlyShifted?: boolean;
  gap: string;
  valueMinWidth: string;
}

const PaymentSummaryRow: React.FC<PaymentSummaryRowProps> = ({
  label,
  value,
  width,
  isSlightlyShifted,
  gap,
  valueMinWidth,
}) => (
  <div
    style={{
      width,
      gap,
      marginLeft: isSlightlyShifted ? '6px' : '7px',
    }}
    className="flex justify-between items-center h-[47px]"
  >
    <div className="font-['Nunito'] text-xs min-w-[160px] whitespace-nowrap text-black leading-none font-normal">
      {label}
    </div>
    <div
      style={{ minWidth: valueMinWidth }}
      className="font-['Nunito'] text-base whitespace-nowrap text-black leading-none font-bold"
    >
      {value}
    </div>
  </div>
);

export default PaymentSummaryRow;