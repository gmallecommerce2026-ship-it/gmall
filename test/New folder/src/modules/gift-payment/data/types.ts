export interface IGiftWrapCard {
  imageUrl: string;
  iconUrl: string;
  iconAlt: string;
}

export interface IShippingOption {
  text: string;
  isHeader?: boolean;
  minWidth: string;
}

export interface IVoucherOption {
  text: string;
  isLarge?: boolean;
  isMediumWeight?: boolean;
  minWidth: string;
  marginTop?: string;
}

export interface IPaymentSummaryRow {
  label: string;
  value: string;
  width: string;
  isSlightlyShifted?: boolean;
  gap: string;
  valueMinWidth: string;
}